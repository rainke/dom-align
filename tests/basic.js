import $ from 'jquery';
import expect from 'expect.js';
import domAlign from '../src';

describe('dom-align', () => {
  function toBeEqualRect(actual, expects) {
    for (const i in actual) {
      if (actual[i] - expects[i] >= 5) {
        return false;
      }
    }
    return true;
  }

  function run(useCssTransform) {
    describe(`useCssTransform=${!!useCssTransform}`, () => {
      describe('basic', () => {
        it('unified getOffsetParent method', () => {
          const getOffsetParent = domAlign.__getOffsetParent;
          const test = [];
          test[0] = `<div><div></div></div>`;

          test[1] = `<div><div style='position: relative;'></div></div>`;

          test[2] =
            `<div>` +
            `<div>` +
            `<div style='position: absolute;'></div>` +
            `</div>` +
            `</div>`;

          test[3] =
            `<div style='position: relative;'>` +
            `<div>` +
            `<div style='position: absolute;'></div>` +
            `</div>` +
            `</div>`;

          const dom = [];

          for (let i = 0; i < 4; i++) {
            dom[i] = $(test[i])[0];
            document.body.appendChild(dom[i]);
          }

          expect(getOffsetParent(dom[0].firstChild)).to.be(dom[0]);
          expect(getOffsetParent(dom[1].firstChild)).to.be(dom[1]);
          expect(getOffsetParent(dom[2].firstChild.firstChild)).to.be(null);
          expect(getOffsetParent(dom[3].firstChild.firstChild)).to.be(dom[3]);

          for (let i = 0; i < 4; i++) {
            $(dom[i]).remove();
          }
        });

        it('getVisiblerectforelement clip by viewport if ancestor is fixed', () => {
          if (navigator.userAgent.toLowerCase().indexOf('phantomjs') !== -1) {
            return;
          }

          const $ele = $(
            `<div style='height: 1500px;width: 100000px;'></div>`,
          ).appendTo(document.body);

          const node = $(`
            <div style="position: fixed;top: 0;left: 0;">
              <div style="position: absolute;width: 10px;height: 10px;"></div>
            <div>
          `).appendTo(document.body);

          const getVisibleRectForElement = domAlign.__getVisibleRectForElement;
          window.scrollTo(100, 100);

          const element = node.children().get(0);
          const visibleRect = getVisibleRectForElement(element);
          expect(visibleRect.top).to.be(100);
          expect(visibleRect.left).to.be(100);
          expect(visibleRect.right).to.be(100 + $(window).width());
          expect(visibleRect.bottom).to.be(100 + $(window).height());

          $ele.remove();
        });

        it('getVisibleRectForElement clip by document if ancestor is not fixed', (done) => {
          const gap = $(
            `<div style='height: 1500px;width: 100000px;'></div>`,
          )[0];
          document.body.appendChild(gap);

          const getVisibleRectForElement = domAlign.__getVisibleRectForElement;
          const test = [];

          test[0] = `<div><div></div></div>`;

          test[1] =
            `<div style='width: 100px;height: 100px;overflow: hidden;'>` +
            `<div style='position: relative;'></div></div>`;

          test[2] =
            `<div style='width: 100px;height: 100px;overflow: hidden;'>` +
            `<div>` +
            `<div style='position: absolute;'></div>` +
            `</div>` +
            `</div>`;

          test[3] =
            `<div style='position: relative;width: 100px;` +
            `height: 100px;overflow: hidden;'>` +
            `<div>` +
            `<div style='position: absolute;'></div>` +
            `</div>` +
            `</div>`;

          const dom = [];

          for (let i = 3; i >= 0; i--) {
            dom[i] = $(test[i])[0];
            document.body.appendChild(dom[i]);
          }

          // 1
          window.scrollTo(10, 10);

          const documentWidth = document.documentElement.scrollWidth;
          const documentHeight = document.documentElement.scrollHeight;

          let rect = getVisibleRectForElement(dom[0].firstChild);
          expect(rect.left).to.eql(0);
          expect(rect.top).to.eql(0);
          expect(rect.right).to.eql(documentWidth);
          expect(rect.bottom).to.eql(documentHeight);

          if (navigator.userAgent.toLowerCase().indexOf('phantomjs') !== -1) {
            return done();
          }

          window.scrollTo(200, 200);

          rect = getVisibleRectForElement(dom[0].firstChild);
          expect(rect.left).to.eql(0);
          expect(rect.top).to.eql(0);
          expect(rect.right).to.eql(documentWidth);
          expect(rect.bottom).to.eql(documentHeight);

          $(dom[0]).remove();

          // 2
          window.scrollTo(10, 10);
          rect = getVisibleRectForElement(dom[1].firstChild);
          expect(
            toBeEqualRect(rect, {
              left: 0,
              top: $(dom[1]).offset().top,
              right: 100,
              bottom: $(dom[1]).offset().top + 100,
            }),
          ).to.be.ok();

          window.scrollTo(200, 200);
          rect = getVisibleRectForElement(dom[1].firstChild);
          expect(
            toBeEqualRect(rect, {
              left: 0,
              top: $(dom[1]).offset().top,
              right: 100,
              bottom: $(dom[1]).offset().top + 100,
            }),
          ).to.be.ok();
          $(dom[1]).remove();

          // 3
          window.scrollTo(10, 10);
          rect = getVisibleRectForElement(dom[2].firstChild);
          expect(
            toBeEqualRect(rect, {
              left: 0,
              top: $(dom[2]).offset().top,
              right: 100,
              bottom: $(dom[2]).offset().top + 100,
            }),
          ).to.be.ok();

          window.scrollTo(200, 200);
          rect = getVisibleRectForElement(dom[2].firstChild);
          expect(
            toBeEqualRect(rect, {
              left: 0,
              top: $(dom[2]).offset().top,
              right: 100,
              bottom: $(dom[2]).offset().top + 100,
            }),
          ).to.be.ok();
          $(dom[2]).remove();

          // 4
          window.scrollTo(10, 10);
          rect = getVisibleRectForElement(dom[3].firstChild);
          expect(
            toBeEqualRect(rect, {
              left: 0,
              top: $(dom[3]).offset().top,
              right: 100,
              bottom: $(dom[3]).offset().top + 100,
            }),
          ).to.be.ok();

          window.scrollTo(200, 200);
          rect = getVisibleRectForElement(dom[3].firstChild);
          expect(
            toBeEqualRect(rect, {
              left: 0,
              top: $(dom[3]).offset().top,
              right: 100,
              bottom: $(dom[3]).offset().top + 100,
            }),
          ).to.be.ok();
          $(dom[3]).remove();
          $(gap).remove();

          setTimeout(() => {
            window.scrollTo(0, 0);
            done();
          }, 200);
        });

        it('offset and percentage offset support percentage', () => {
          const node = $(
            '<div>' +
              '<div style="width:100px;height:100px;position: absolute;left:0;top:0"></div>' +
              '<div style="width:50px;height:60px;position: absolute;left:0;top:0"></div>' +
              '</div>',
          ).appendTo(document.body);
          const target = node[0].firstChild;
          const source = target.nextSibling;

          const result = domAlign(source, target, {
            points: ['tl', 'tl'],
            overflow: {
              adjustX: 0,
              adjustY: 0,
            },
            offset: ['-50%', '-50%'],
            targetOffset: ['-50%', '-50%'],
          });
          expect(result.points).to.eql(['tl', 'tl']);

          expect($(source).offset()).to.eql({
            top: 20,
            left: 25,
          });
        });
      });

      describe('useCssRight and useCssBottom', () => {
        it('works', () => {
          const node = $(
            '<div>' +
              '<div style="width:100px;height:100px;position: absolute;left:0;top:0;"></div>' +
              '<div style="width:50px;height:60px;position: absolute;"></div>' +
              '</div>',
          ).appendTo(document.body);
          const target = node[0].firstChild;
          const source = target.nextSibling;

          const result = domAlign(source, target, {
            points: ['tl', 'tl'],
            overflow: {
              adjustX: 0,
              adjustY: 0,
            },
            useCssRight: 1,
            useCssBottom: 1,
            offset: ['-50%', '-50%'],
            targetOffset: ['-50%', '-50%'],
          });
          expect(result.points).to.eql(['tl', 'tl']);
          expect($(source)[0].style.left).to.be('');
          expect($(source)[0].style.top).to.be('');
          expect($(source)[0].style.right).not.to.be('');
          expect($(source)[0].style.bottom).not.to.be('');

          expect($(source).offset()).to.eql({
            top: 20,
            left: 25,
          });
        });
      });

      it('center align must ok', () => {
        if (navigator.userAgent.toLowerCase().indexOf('phantomjs') !== -1) {
          return;
        }
        const node = $(`<div style='position: absolute;left:0;top:0;
        width: 100px;height: 100px;
        overflow: hidden'>
        <div style='position: absolute;
        width: 50px;
        height: 50px;'>
        </div>
        <div style='position: absolute;left:0;top:20px;'></div>
        <div style='position: absolute;left:0;top:80px;width:100px;height:5px;'></div>
        </div>`).appendTo('body');

        const target = node.children().eq(0);
        // upper = node.children().eq(1),
        const lower = node.children().eq(2);

        const containerOffset = node.offset();
        // const targetOffset = target.offset();

        const result = domAlign(target[0], lower[0], {
          points: ['bc', 'tc'],
        });

        //    _____________
        //   |             |
        //   |  ________   |
        //   |  |      |   |
        //   |__|______|___|
        //   |_____________|
        expect(result.points).to.eql(['bc', 'tc']);
        expect(target.offset().left - 25).within(-10, 10);

        expect(target.offset().top - containerOffset.top - 30).within(-10, 10);
      });

      it('works when target is window', () => {
        if (navigator.userAgent.toLowerCase().indexOf('phantomjs') !== -1) {
          return;
        }
        const node = $(`
          <div style='position: absolute;left:50px;top:80px;width:100px;height:5px;'></div>
        `).appendTo('body');
        const result = domAlign(node.get(0), window, {
          points: ['tl', 'tl'],
        });
        expect(result.points).to.eql(['tl', 'tl']);
        expect(node.offset().top).to.be(0);
        expect(node.offset().left).to.be(0);
      });

      it('works when target is document', () => {
        if (navigator.userAgent.toLowerCase().indexOf('phantomjs') !== -1) {
          return;
        }
        const node = $(`
          <div style='position: absolute;left:50px;top:80px;width:100px;height:5px;'></div>
        `).appendTo('body');
        const result = domAlign(node.get(0), document, {
          points: ['tl', 'tl'],
        });
        expect(result.points).to.eql(['tl', 'tl']);
        expect(node.offset().top).to.be(0);
        expect(node.offset().left).to.be(0);
      });

      it('works when target is svg', () => {
        if (navigator.userAgent.toLowerCase().indexOf('phantomjs') !== -1) {
          return;
        }
        const node = $(`
          <div style="position: absolute;left: 0;top: 0">
            <div style="position: absolute;width: 50px;height: 50px"></div>
            <svg><rect width="100" height="100"></rect></svg>
          </div>
        `).appendTo('body');
        const target = node.find('rect');
        const source = node.children().eq(0);
        const result = domAlign(source[0], target[0], {
          points: ['cc', 'cc'],
        });
        expect(result.points).to.eql(['cc', 'cc']);
        expect(source.offset().top).to.be(25);
        expect(source.offset().left).to.be(25);
      });

      describe('auto align', () => {
        it('should not auto adjust if current position is right', () => {
          if (navigator.userAgent.toLowerCase().indexOf('phantomjs') !== -1) {
            return;
          }
          const node = $(`<div style='position: absolute;left:0;top:0;
        width: 100px;height: 100px;
        overflow: hidden'>
        <div style='position: absolute;
        width: 50px;
        height: 50px;'>
        </div>
        <div style='position: absolute;left:0;top:20px;'></div>
        <div style='position: absolute;left:0;top:80px;width:5px;height:5px;'></div>
        </div>`).appendTo('body');

          const target = node.children().eq(0);
          // upper = node.children().eq(1),
          const lower = node.children().eq(2);

          let containerOffset = node.offset();
          // const targetOffset = target.offset();

          const result = domAlign(target[0], lower[0], {
            points: ['bl', 'tl'],
          });

          // const afterTargetOffset = target.offset();

          //    _____________
          //   |             |
          //   |______       |
          //   |      |      |
          //   |______|______|
          //   |_____________|

          expect(result.points).to.eql(['bl', 'tl']);

          expect(target.offset().left - containerOffset.left).within(-10, 10);

          expect(target.offset().top - containerOffset.top - 30).within(
            -10,
            10,
          );

          const result2 = domAlign(target[0], lower[0], {
            points: ['tl', 'bl'],
            overflow: {
              adjustX: 1,
              adjustY: 1,
            },
          });

          //    _____________
          //   |             |
          //   |______       |
          //   |      |      |
          //   |______|______|
          //   |_____________|
          // flip 然后 ok
          expect(result2.points).to.eql(['bl', 'tl']);
          containerOffset = node.offset();
          expect(target.offset().left - containerOffset.left).within(-10, 10);
          const actual = target.offset().top;
          const expected = containerOffset.top + 30;
          expect(actual - expected).within(-5, 5);

          const result3 = domAlign(target[0], lower[0], {
            points: ['bl', 'tl'],
            offset: ['50%', '50%'],
          });
          expect(result3.points).to.eql(['bl', 'tl']);
          expect(target.offset().left - containerOffset.left).to.be(25);
          expect(target.offset().top - containerOffset.top).to.be(55);
        });

        it('should not auto adjust if target is out of visible rect', () => {
          if (navigator.userAgent.toLowerCase().indexOf('phantomjs') !== -1) {
            return;
          }
          const node = $(`
           <div style='position:absolute;left:0;top:0;width:100px;height:100px;overflow:hidden'>
            <div style='position:absolute;top:0;left:0;width:50px;height:50px;'></div>
            <div style='position:absolute;left:80px;top:80px;'></div>
           </div>
          `).appendTo('body');

          const target = node.children().eq(0);
          const source = node.children().eq(1);
          const result = domAlign(source[0], target[0], {
            points: ['tl', 'tl'],
            overflow: {
              adjustX: 1,
              adjustY: 1,
            },
          });

          expect(result.points).to.eql(['tl', 'tl']);
          expect(source.offset().top - target.offset().top).to.be(0);
          expect(source.offset().left - target.offset().left).to.be(0);

          target.css({ top: -50, left: -50 });
          const result2 = domAlign(source[0], target[0], {
            points: ['tl', 'tl'],
            overflow: {
              adjustX: 1,
              adjustY: 1,
            },
          });

          expect(result.points).to.eql(['tl', 'tl']);
          expect(source.offset().top - target.offset().top).to.be(0);
          expect(source.offset().left - target.offset().left).to.be(0);
        });

        it('should auto adjust if current position is not right', () => {
          if (navigator.userAgent.toLowerCase().indexOf('phantomjs') !== -1) {
            return;
          }
          const node = $(`<div style='position: absolute;left:100px;top:100px;
        width: 100px;height: 100px;
        overflow: hidden'>
        <div style='position: absolute;
        width: 50px;
        height: 90px;'>
        </div>
        <div style='position: absolute;left:0;top:20px;'></div>
        <div style='position: absolute;left:0;top:80px;width:5px;height:5px;'></div>
        </div>`).appendTo('body');

          const target = node.children().eq(0);
          // upper = node.children().eq(1),
          const lower = node.children().eq(2);

          const containerOffset = node.offset();
          const result = domAlign(target[0], lower[0], {
            points: ['bl', 'tl'],
          });
          //   |------|
          //   |______|_______
          //   |      |      |
          //   |      |      |
          //   |      |      |
          //   |______|______|
          //   |_____________|

          expect(result.points).to.eql(['bl', 'tl']);
          expect(target.offset().left - containerOffset.left).within(-5, 5);
          expect(target.offset().top - (containerOffset.top - 10)).within(
            -5,
            5,
          );

          const result2 = domAlign(target[0], lower[0], {
            points: ['tl', 'bl'],
            overflow: {
              adjustX: 1,
              adjustY: 1,
            },
          });

          //    _____________
          //   |      |      |
          //   |--- --|      |
          //   |      |      |
          //   |______|______|
          //   |      |      |
          //   |______|______|
          // flip 不 ok，对 flip 后的 adjustY 到视窗边界
          expect(result2.points).to.eql(['tl', 'bl']);
          expect(target.offset().left - containerOffset.left).within(-5, 5);
          expect(target.offset().top - containerOffset.top).within(-5, 5);
        });

        it('should consider offset when calculate realXRegion and realYRegion', () => {
          if (navigator.userAgent.toLowerCase().indexOf('phantomjs') !== -1) {
            return;
          }
          const node = $(`
            <div style="position: absolute;width: 100px;height: 100px;">
              <div style="position: absolute;top: 25px;left:25px;width: 50px;height: 50px;">
              </div>
              <div style="position: absolute;width: 5px;height: 5px"></div>
            </div>
          `).appendTo('body');
          const source = node.children().eq(1);
          const target = node.children().eq(0);
          // See: https://github.com/ant-design/ant-design/issues/6347
          const result = domAlign(source[0], target[0], {
            points: ['tl', 'tl'],
            offset: [-9, -9],
            overflow: {
              adjustX: 1,
              adjustY: 1,
            },
          });
          expect(result.points).to.eql(['tl', 'tl']);
          expect(source.offset().top + 9 - target.offset().top).within(-5, 5);
          expect(source.offset().left + 9 - target.offset().left).within(-5, 5);
        });

        it('should have correct points', () => {
          if (navigator.userAgent.toLowerCase().indexOf('phantomjs') !== -1) {
            return;
          }

          // 让 src 放不下，偏移到右侧
          //   |-----|
          //   |     | TOP |
          //   |     |-----|
          //   | src | tgt |
          //   |     |-----|
          //   |     |
          //   |-----|

          // To

          //     TOP |-----|
          //   |-----|     |
          //   | tgt |     |
          //   |-----| src |
          //         |     |
          //         |     |
          //         |-----|

          const node = $(`
            <div style="position: absolute; width: 100px; height: 100px;">
              <div style="position: absolute; top: 10px; left:0; width: 50px; height: 50px;">
              </div>
              <div style="position: absolute; width: 50px; height: 100px"></div>
            </div>
          `).appendTo('body');
          const source = node.children().eq(1);
          const target = node.children().eq(0);

          const result = domAlign(source[0], target[0], {
            points: ['cr', 'cl'],
            offset: [0, 0],
            overflow: {
              adjustX: true,
              adjustY: true,
            },
          });

          expect(result.points).to.eql(['cl', 'cr']);
          expect(source.offset().top).within(-5, 5);
          expect(source.offset().left - target.width()).within(-5, 5);

          node.remove();
        });
      });
    });
  }

  run(false);

  if (window.TransitionEvent) {
    run(true);
  }
});
