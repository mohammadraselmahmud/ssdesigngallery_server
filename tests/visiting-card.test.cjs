require(
  require.resolve('ts-node/register/transpile-only', {
    paths: [require.resolve('ts-node-dev')],
  }),
);
const { test, beforeEach } = require('node:test');
const { Contents } = require('../src/app/modules/contents/contents.models');
beforeEach(t => {
  t.mock.method(Contents, 'findById', () => ({ lean: async () => null }));
});
const assert = require('node:assert/strict');
const { aiValidation } = require('../src/app/modules/ai/ai.validation');
const {
  generateVisitingCard,
} = require('../src/app/modules/ai/visitingCard.service');
const Subscription =
  require('../src/app/modules/subscription/subscription.models').default;
const { User } = require('../src/app/modules/user/user.models');

process.env.IMG_BASE_URL = 'https://cards.example.com';
const payload = {
  demoImageUrl: 'https://cards.example.com/demo.jpg',
  information: { name: 'নাজমুল হাসান', phone: '+8801700000000' },
};

test('validates reference host and card information', () => {
  const parse = body =>
    aiValidation.generateVisitingCardSchema.safeParse({ body });
  assert.equal(parse(payload).success, true);
  assert.equal(
    parse({ ...payload, demoImageUrl: 'https://untrusted.example/demo.jpg' })
      .success,
    false,
  );
  assert.equal(
    parse({ ...payload, information: { name: ' ' } }).success,
    false,
  );
  assert.equal(
    parse({ ...payload, information: { name: 'A', email: 'invalid' } }).success,
    false,
  );
});

test('sends one reference with exact Bengali/contact data; admins bypass credits', async () => {
  const result = await generateVisitingCard(payload, 'user-id', 'admin', {
    run: async (model, { input }) => {
      assert.equal(model, 'prunaai/p-image-edit');
      assert.deepEqual(input.images, [payload.demoImageUrl]);
      assert.ok(input.prompt.includes(payload.information.name));
      assert.ok(input.prompt.includes(payload.information.phone));
      assert.equal(input.disable_safety_checker, false);
      return { url: () => new URL('https://output.example/card.png') };
    },
  });
  assert.equal(result.generatedUrl, 'https://output.example/card.png');
  assert.equal(result.unlimited, true);
});

test('reserves credits, refunds failures, and blocks exhausted users', async t => {
  t.mock.method(Subscription, 'findOneAndUpdate', () => ({
    lean: async () => null,
  }));
  t.mock.method(Subscription, 'exists', async () => null);
  t.mock.method(User, 'findOneAndUpdate', () => ({
    lean: async () => ({ freeAiImageCount: 1 }),
  }));
  const refundFree = t.mock.method(User, 'updateOne', async () => ({}));
  const refundPaid = t.mock.method(Subscription, 'updateOne', async () => ({}));
  const failingClient = {
    run: async () => {
      throw new Error('provider failure');
    },
  };
  await assert.rejects(
    generateVisitingCard(payload, 'id', 'user', failingClient),
    /Failed to generate/,
  );
  assert.deepEqual(refundFree.mock.calls[0].arguments[1], {
    $inc: { freeAiImageCount: -1 },
  });

  const success = await generateVisitingCard(payload, 'id', 'user', {
    run: async () => 'https://output.example/card.png',
  });
  assert.equal(success.freeAiImageCount, 1);
  assert.equal(refundFree.mock.callCount(), 1);

  Subscription.findOneAndUpdate.mock.mockImplementation(() => ({
    lean: async () => ({
      _id: 'sub-id',
      totalCredit: 5,
      usedCredit: 1,
      remainingCredit: 4,
    }),
  }));
  await assert.rejects(
    generateVisitingCard(payload, 'id', 'user', { run: async () => [] }),
    /image URL/,
  );
  assert.deepEqual(refundPaid.mock.calls[0].arguments[1], {
    $inc: { usedCredit: -1, remainingCredit: 1 },
  });

  Subscription.findOneAndUpdate.mock.mockImplementation(() => ({
    lean: async () => null,
  }));
  Subscription.exists.mock.mockImplementation(async () => ({ _id: 'sub-id' }));
  await assert.rejects(
    generateVisitingCard(payload, 'id', 'user', failingClient),
    /exhausted/,
  );
  Subscription.exists.mock.mockImplementation(async () => null);
  User.findOneAndUpdate.mock.mockImplementation(() => ({
    lean: async () => null,
  }));
  await assert.rejects(
    generateVisitingCard(payload, 'id', 'user', failingClient),
    /2 free AI images/,
  );
  await assert.rejects(
    generateVisitingCard(payload, undefined, 'admin', failingClient),
    /authentication/,
  );
});
