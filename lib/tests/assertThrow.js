async function assertThrow(promise, message) {
  try {
    await promise;
    assert.fail();
  } catch (error) {
    const revertFound = error.message.search(message) >= 0;
    assert(revertFound, `Expected ${message}, got ${error} instead`);
  }
}

module.exports = {
  assertThrow
};