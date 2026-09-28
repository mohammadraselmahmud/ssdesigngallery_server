require(
  require.resolve('ts-node/register/transpile-only', {
    paths: [require.resolve('ts-node-dev')],
  }),
);
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Contents } = require('../src/app/modules/contents/contents.models');
const {
  getContents,
  assertAiGenerationEnabled,
} = require('../src/app/modules/contents/contents.service');
const { generateSsDesignPreview } = require('../src/app/modules/ai/ai.service');
const {
  generateVisitingCard,
} = require('../src/app/modules/ai/visitingCard.service');
const Subscription =
  require('../src/app/modules/subscription/subscription.models').default;
const { User } = require('../src/app/modules/user/user.models');

test('missing settings keep AI enabled; toggles are read on every request', async t => {
  let settings = null;
  t.mock.method(Contents, 'findById', () => ({ lean: async () => settings }));
  assert.deepEqual(await getContents(), { turnOffAiOption: false });
  await assertAiGenerationEnabled();
  settings = { turnOffAiOption: true };
  await assert.rejects(assertAiGenerationEnabled(), { statusCode: 403 });
  settings = { turnOffAiOption: false };
  await assertAiGenerationEnabled();
});

test('disabled AI blocks both generators including admins before provider or credit changes', async t => {
  t.mock.method(Contents, 'findById', () => ({
    lean: async () => ({ turnOffAiOption: true }),
  }));
  const unexpected = () =>
    assert.fail('Must stop before provider or credit operations');
  t.mock.method(Subscription, 'updateMany', unexpected);
  t.mock.method(Subscription, 'findOneAndUpdate', unexpected);
  t.mock.method(User, 'findOneAndUpdate', unexpected);
  t.mock.method(console, 'error', () => {});
  for (const generate of [generateSsDesignPreview, generateVisitingCard]) {
    for (const role of ['user', 'admin']) {
      await assert.rejects(generate({}, 'user-id', role, { run: unexpected }), {
        statusCode: 403,
        message:
          'AI image generation is currently disabled by the administrator.',
      });
    }
  }
});
