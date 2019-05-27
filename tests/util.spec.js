import {
  convertTreeToEntities
} from '../src/util';

describe('Util', () => {
  it('convertTreeToEntities with additional handler', () => {
    const onProcessFinished = jest.fn();

    const tree = [{
      key:"key",
      title: "test",
      value: "ttt"
    }]

    const { keyEntities, valueEntities } = convertTreeToEntities(tree, {
      initWrapper: wrapper => ({
        ...wrapper,
        valueEntities: {},
      }),
      processEntity: (entity, wrapper) => {
        wrapper.valueEntities[entity.node.value] = entity;
      },
      onProcessFinished,
    });

    expect(onProcessFinished).toBeCalled();
    expect(valueEntities.ttt).toBe(keyEntities.key);
  });
})