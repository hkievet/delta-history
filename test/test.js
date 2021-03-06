'use strict';

const assert = require('chai').assert;
const vcd = require('vcdiff');

const createDeltaHistory = require('../lib/create_delta_history');
const DeltaHistory = require('../lib/delta_history');

describe('createDeltaHistory', function() {
  it('returns an instance of DeltaHistory', function() {
    assert.instanceOf(createDeltaHistory(), DeltaHistory);
  });
});

describe('History', function() {
  describe('#addVersion', function() {
    it('returns a string', function() {
      let deltaHistory = createDeltaHistory();
      let versionId = deltaHistory.addVersion('testFile', new Buffer('some text'));
      assert.typeOf(versionId, 'string');
    });
    it('dirty fileId', function() {
      let deltaHistory = createDeltaHistory();
      let versionId = deltaHistory.addVersion('/', new Buffer('some text'));
      assert.typeOf(versionId, 'string');
    });
  });
  describe('#getLastestVersion', function() {
    it('returns the buffer of the last file put it', function() {
      let deltaHistory = createDeltaHistory();
      deltaHistory.addVersion('testFile', new Buffer('some text'));
      deltaHistory.addVersion('testFile', new Buffer('some different text'));
      let lastVersion = deltaHistory.getLatestVersion('testFile').toString();
      assert.strictEqual(lastVersion, 'some different text');
    });
  });

  describe('#getDelta', function() {
    it('returns buffer delta that can be used to construct that last version', function() {
      let deltaHistory = createDeltaHistory();
      let sourceString = 'some text';
      let targetString = 'some different text';
      let version1Id = deltaHistory.addVersion('testFile', new Buffer(sourceString));
      deltaHistory.addVersion('testFile', new Buffer(targetString));
      let delta = deltaHistory.getDelta('testFile', version1Id);
      let decoded = vcd.vcdiffDecodeSync(delta, { dictionary: new Buffer(sourceString) });
      assert.strictEqual(decoded.toString(), targetString);
    });
    it('returns undefined when versionId does not exist', function() {
      let deltaHistory = createDeltaHistory();
      let sourceString = 'some text';
      let targetString = 'some different text';
      deltaHistory.addVersion('testFile', new Buffer('some text'));
      let delta = deltaHistory.getDelta('testFile', 'non existent versionid');
      assert.isNull(delta);
    });
  });

  describe('#reset', function() {
    it('removes files and deltas so that previous versions are empty', function() {
      let deltaHistory = createDeltaHistory();
      let version1Id = deltaHistory.addVersion('testFile', new Buffer('some text'));
      deltaHistory.addVersion('testFile', new Buffer('some different text'));
      deltaHistory.reset();
      assert.isNull(deltaHistory.getLatestVersion('testFile'));
      assert.isNull(deltaHistory.getDelta('testFile', version1Id));
    });
  });
});