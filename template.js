const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
// react-icons から必要なアイコンをインポート
// 例: const { FaCheckCircle, FaChartLine } = require("react-icons/fa");

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * react-icons の SVG をレンダリングする
 */
function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

/**
 * react-icons のアイコンを Base64 PNG に変換する
 * @param {Function} IconComponent - react-icons のコンポーネント
 * @param {string} color - 色（"#" 付き、例: "#4472C4"）
 * @param {number} size - ラスタライズ解像度（256以上推奨）
 * @returns {Promise<string>} Base64データ文字列
 */
async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

/**
 * 2点間に矢印付き直線を描画する
 * @param {object} slide - スライドオブジェクト
 * @param {object} pres - プレゼンテーションオブジェクト
 * @param {number} x1 - 始点 X
 * @param {number} y1 - 始点 Y
 * @param {number} x2 - 終点 X
 * @param {number} y2 - 終点 Y
 * @param {string} color - 色（6桁hex、"#"なし）
 */
function drawArrow(slide, pres, x1, y1, x2, y2, color) {
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const w = Math.max(Math.abs(x2 - x1), 0.01);
  const h = Math.max(Math.abs(y2 - y1), 0.01);

  let isFlipV = false;
  let arrowOpt = {};

  if ((x1 < x2 && y1 < y2) || (x1 > x2 && y1 > y2)) {
    isFlipV = false;
    if (x1 < x2) arrowOpt = { endArrowType: "triangle" };
    else arrowOpt = { beginArrowType: "triangle" };
  } else {
    isFlipV = true;
    if (x1 < x2) arrowOpt = { endArrowType: "triangle" };
    else arrowOpt = { beginArrowType: "triangle" };
  }

  slide.addShape(pres.shapes.LINE, {
    x, y, w, h,
    flipV: isFlipV,
    line: { color, width: 2, ...arrowOpt },
  });
}

// ============================================================
// シャドウ等の共通スタイル（毎回新しいオブジェクトを返すこと）
// ※ PptxGenJS はオプションオブジェクトを内部で変更するため再利用不可
// ============================================================
const defaultFontFace = "Meiryo";

const makeShadow = () => ({
  type: "outer",
  color: "000000",
  opacity: 0.1,
  blur: 6,
  offset: 2,
  angle: 135,
});

// ============================================================
// メイン処理
// ============================================================
async function main() {
  let pres = new pptxgen();

  // --- プレゼンテーション設定 ---
  pres.layout = "LAYOUT_16x9"; // 10" × 5.625"
  pres.author = "Author Name";
  pres.title = "Presentation Title";

  // --- アイコン生成（必要に応じて） ---
  // const checkIcon = await iconToBase64Png(FaCheckCircle, "#4472C4", 256);

  // ============================================================
  // スライド 1: タイトルスライド
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: "F8F9FA" };

    // タイトル
    slide.addText("プレゼンテーションタイトル", {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 1.2,
      fontSize: 36,
      bold: true,
      color: "1E293B",
      align: "center",
      valign: "middle",
      fontFace: defaultFontFace,
    });

    // サブタイトル
    slide.addText("サブタイトル・補足説明をここに記載", {
      x: 0.5,
      y: 2.8,
      w: 9,
      h: 0.8,
      fontSize: 18,
      color: "64748B",
      align: "center",
      valign: "middle",
      fontFace: defaultFontFace,
    });

    // 日付
    slide.addText("2026年3月", {
      x: 0.5,
      y: 4.5,
      w: 9,
      h: 0.5,
      fontSize: 14,
      color: "94A3B8",
      align: "center",
      fontFace: defaultFontFace,
    });
  }

  // ============================================================
  // スライド 2: コンテンツスライド（箇条書き）
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: "FFFFFF" };

    // スライドタイトル
    slide.addText("スライドタイトル", {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.7,
      fontSize: 28,
      bold: true,
      color: "1E293B",
      margin: 0,
      fontFace: defaultFontFace,
    });

    // タイトル下の区切り線
    slide.addShape(pres.shapes.LINE, {
      x: 0.5,
      y: 1.0,
      w: 9,
      h: 0,
      line: { color: "E2E8F0", width: 1 },
    });

    // 箇条書き
    slide.addText(
      [
        { text: "ポイント1: ここに説明を書く", options: { bullet: true, breakLine: true } },
        { text: "ポイント2: ここに説明を書く", options: { bullet: true, breakLine: true } },
        { text: "ポイント3: ここに説明を書く", options: { bullet: true, breakLine: true } },
        {
          text: "サブポイント: 詳細な説明",
          options: { bullet: true, indentLevel: 1, breakLine: true },
        },
        { text: "ポイント4: ここに説明を書く", options: { bullet: true } },
      ],
      {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 3.5,
        fontSize: 16,
        color: "334155",
        valign: "top",
        paraSpaceAfter: 6,
        fontFace: defaultFontFace,
      }
    );
  }

  // ============================================================
  // スライド 3: カード型レイアウト
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: "F8F9FA" };

    // スライドタイトル
    slide.addText("カード型レイアウト", {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.7,
      fontSize: 28,
      bold: true,
      color: "1E293B",
      margin: 0,
      fontFace: defaultFontFace,
    });

    // カード描画ヘルパー
    const cardW = 2.7;
    const cardH = 3.2;
    const cardY = 1.3;
    const colors = ["3B82F6", "10B981", "F59E0B"];
    const titles = ["カード1", "カード2", "カード3"];
    const descriptions = [
      "カード1の説明テキスト。\n詳細を記載します。",
      "カード2の説明テキスト。\n詳細を記載します。",
      "カード3の説明テキスト。\n詳細を記載します。",
    ];

    titles.forEach((title, i) => {
      const cardX = 0.5 + i * (cardW + 0.3);

      // カード背景
      slide.addShape(pres.shapes.RECTANGLE, {
        x: cardX,
        y: cardY,
        w: cardW,
        h: cardH,
        fill: { color: "FFFFFF" },
        shadow: makeShadow(),
      });

      // アクセントバー（上部）
      slide.addShape(pres.shapes.RECTANGLE, {
        x: cardX,
        y: cardY,
        w: cardW,
        h: 0.06,
        fill: { color: colors[i] },
      });

      // カードタイトル
      slide.addText(title, {
        x: cardX + 0.15,
        y: cardY + 0.2,
        w: cardW - 0.3,
        h: 0.5,
        fontSize: 18,
        bold: true,
        color: "1E293B",
        margin: 0,
        fontFace: defaultFontFace,
      });

      // カード本文
      slide.addText(descriptions[i], {
        x: cardX + 0.15,
        y: cardY + 0.8,
        w: cardW - 0.3,
        h: 2.0,
        fontSize: 13,
        color: "64748B",
        valign: "top",
        margin: 0,
        fontFace: defaultFontFace,
      });
    });
  }

  // ============================================================
  // スライド 4: 表（テーブル）
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: "FFFFFF" };

    slide.addText("比較表", {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.7,
      fontSize: 28,
      bold: true,
      color: "1E293B",
      margin: 0,
      fontFace: defaultFontFace,
    });

    const headerOpts = {
      fill: { color: "1E293B" },
      color: "FFFFFF",
      bold: true,
      fontSize: 14,
      align: "center",
      valign: "middle",
      fontFace: defaultFontFace,
    };
    const cellOpts = {
      fill: { color: "FFFFFF" },
      color: "334155",
      fontSize: 13,
      align: "center",
      valign: "middle",
      fontFace: defaultFontFace,
    };
    const altCellOpts = {
      fill: { color: "F8FAFC" },
      color: "334155",
      fontSize: 13,
      align: "center",
      valign: "middle",
      fontFace: defaultFontFace,
    };

    const tableData = [
      [
        { text: "項目", options: headerOpts },
        { text: "オプションA", options: headerOpts },
        { text: "オプションB", options: headerOpts },
      ],
      [
        { text: "特徴1", options: cellOpts },
        { text: "○", options: cellOpts },
        { text: "△", options: cellOpts },
      ],
      [
        { text: "特徴2", options: altCellOpts },
        { text: "△", options: altCellOpts },
        { text: "○", options: altCellOpts },
      ],
      [
        { text: "特徴3", options: cellOpts },
        { text: "○", options: cellOpts },
        { text: "○", options: cellOpts },
      ],
    ];

    slide.addTable(tableData, {
      x: 0.5,
      y: 1.2,
      w: 9,
      colW: [3, 3, 3],
      border: { pt: 1, color: "E2E8F0" },
      rowH: [0.5, 0.45, 0.45, 0.45],
    });
  }

  // ============================================================
  // スライド 5: グラフ（チャート）
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: "FFFFFF" };

    slide.addText("データ分析", {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.7,
      fontSize: 28,
      bold: true,
      color: "1E293B",
      margin: 0,
      fontFace: defaultFontFace,
    });

    // 棒グラフ
    slide.addChart(
      pres.charts.BAR,
      [
        {
          name: "系列1",
          labels: ["Q1", "Q2", "Q3", "Q4"],
          values: [4500, 5500, 6200, 7100],
        },
      ],
      {
        x: 0.5,
        y: 1.2,
        w: 5,
        h: 3.5,
        barDir: "col",
        showTitle: true,
        title: "四半期実績",
        chartColors: ["3B82F6"],
        chartArea: { fill: { color: "FFFFFF" }, roundedCorners: true },
        catAxisLabelColor: "64748B",
        valAxisLabelColor: "64748B",
        valGridLine: { color: "E2E8F0", size: 0.5 },
        catGridLine: { style: "none" },
        showValue: true,
        dataLabelPosition: "outEnd",
        dataLabelColor: "1E293B",
        showLegend: false,
      }
    );

    // 円グラフ
    slide.addChart(
      pres.charts.PIE,
      [
        {
          name: "割合",
          labels: ["カテゴリA", "カテゴリB", "カテゴリC"],
          values: [45, 35, 20],
        },
      ],
      {
        x: 6,
        y: 1.2,
        w: 3.5,
        h: 3.5,
        showPercent: true,
        chartColors: ["3B82F6", "10B981", "F59E0B"],
        showLegend: true,
        legendPos: "b",
      }
    );
  }

  // ============================================================
  // ファイル出力
  // ============================================================
  await pres.writeFile({ fileName: "output.pptx" });
  console.log("✅ output.pptx を生成しました");
}

main().catch(console.error);
