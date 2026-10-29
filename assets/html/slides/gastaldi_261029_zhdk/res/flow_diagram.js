// Flow diagram after a TikZ picture, for reveal.js slides, drawn with D3.
//
// flowDiagram(container, spec, steps, options) draws nodes of text placed at
// the coordinates of a TikZ picture, and the edges between them, each part
// coming at one step and, if need be, leaving at a later one:
//
//   spec.nodes  [{id, at, title, text, lines, ...}]
//     id          what the edges refer to;
//     at          [x, y], the centre of the node, in TikZ cm (y upwards);
//     anchor      "edges" to put at `at` the centre of what the edges attach
//                 to (see below) rather than the centre of the node, or
//                 "edges east" or "edges west" its right or left end (TikZ
//                 `anchor=`), so that nodes of different shapes can face each
//                 other exactly;
//     attach      "all" for edges to attach to all the lines of the node
//                 that last as long as it does (alternatives taking turns
//                 there all along), not only to its label;
//     title       a first line, underlined (\underline{...}): the label;
//     text        a first line, plain: the label;
//     lines       the lines below, each a string or {text, color, size, mono,
//                 bold, stage, until}, or a picture {src, width, height,
//                 stage, until} (`width` by `height` cm); an array in place
//                 of a line holds alternatives that take turns in its place;
//     color, size, mono
//                 defaults for the lines (not for `title` or `text`): their
//                 colour, their size relative to `options.fontSize`, a
//                 typewriter font;
//     alertAt     the step from which the title turns red (\alert<k->);
//     image       {src, width, height, view, first, stage, until}: a picture
//                 under the lines (TikZ \includegraphics in the node), or,
//                 `first`, above them, `width` by `height` cm (the picture
//                 fitted in), drawn over the edges that pass behind it; a
//                 page (.html) is shown live, in a frame over the whole
//                 diagram, where it can be handled (a Plotly figure turned):
//                 `view`, [x, y, width, height] in its px, is the part of it
//                 shown, the page being laid out as large as that requires
//                 and scaled down (without `view`, it is laid out at the
//                 picture's size);
//     box         a frame around the node (TikZ `draw, rounded corners`),
//                 at least `minWidth` by `minHeight` cm, its text centred
//                 from the top of its ink to its baseline, as on a button;
//     funnels     with `box`, the trapezia above and below the frame, where
//                 the input comes in and the output goes out;
//     fill        without `box`, a background of that colour, no frame
//                 (TikZ `fill=white`), hiding the edges behind the node;
//   spec.edges  [{from, to, bend, out, in, looseness, fromAt, toAt, path,
//                 corner, style, both, over, color, width, label, labelAt,
//                 labelBelow, labelRight}]
//     from, to    the ids of the nodes it joins;
//     bend        TikZ `bend left=bend`, or `bend right=-bend`, in degrees;
//     path, corner
//                 "-|" or "|-" for an orthogonal edge, TikZ `(a) -| (b)`
//                 (across, then up or down) or `(a) |- (b)`, its corner
//                 rounded to a quarter circle of `corner` cm (TikZ
//                 `rounded corners`), or, with `corner: true`, all of it
//                 one circular arc leaving along its first leg;
//     out, in     TikZ `out=`, `in=`, in degrees: the direction in which the
//                 edge leaves its first node, and the side from which it
//                 comes into the second (either overrides `bend`);
//     looseness   TikZ `looseness=`: how far out a bent edge swings, by
//                 default `options.looseness`;
//     fromAt, toAt
//                 the points of the borders it leaves from and comes into,
//                 where they are not those its directions point to: angles
//                 from the centres (TikZ `(node.angle)`), or "east", "north
//                 west" and the like (TikZ `(node.east)`); a bend is then
//                 taken off the line between them;
//     style       "solid", "dashed" or "double" (TikZ `double`);
//     both        a head at either end (TikZ `<->`);
//     over        drawn over the pictures and the text rather than under
//                 them, as TikZ draws an edge drawn after them (one that
//                 ends in a picture, or crosses it), but still under the
//                 frames, whose white hides what passes behind them;
//     width       of its line, by default `options.lineWidth` if it is black
//                 and `options.accentWidth` if it is coloured;
//     label       a text along the edge, "\n" between its lines, centred at
//                 `labelAt` of the way (0.5 by default), its top `labelBelow`
//                 pt under the curve (TikZ `below=`), `labelRight` pt to the
//                 right of it (TikZ `xshift=`).
//   Nodes, lines and edges come at step `stage` (1 by default) and leave at
//   step `until` (never, by default).
//
// Text may hold *italics* and subscripts, _1 or _{...}: enough for
// (*i*_1, *o*_1). Edges leave and reach a node at its frame or funnels, or,
// without a frame, `options.gap` away from the ink of its label: the lines
// under it, and the alternatives that come and go there, stay clear of the
// edges and leave no blank between them and the label. A bent edge leaves
// in the direction TikZ gives it, so a picture can be copied coordinate by
// coordinate.
//
// Step k is drawn once k of the elements of `steps` are `visible` (reveal.js
// fragments, or an element made visible when the slide comes): nodes fade in,
// solid and double edges are drawn from tail to head, dashed ones fade in,
// once what leaves at that step has faded out, so that nothing crosses what
// it replaces; going back undoes each step. In print view (?print-pdf),
// every copy of the slide that reveal.js makes, one per fragment, is drawn
// at its own step.
//
//   <div id="flow"></div>
//   <div class="fragment" id="flow-1"></div>
//   <div class="fragment" id="flow-2"></div>
//   <script>flowDiagram("#flow",
//                       {nodes: [{id: "a", at: [0, 0], text: "A"},
//                                {id: "b", at: [4, 0], text: "B", stage: 2}],
//                        edges: [{from: "a", to: "b", bend: 20, stage: 2}]},
//                       ["#flow-1", "#flow-2"]);</script>

function flowDiagram(container, spec, steps, options = {}) {
  const {
    unit = 80,              // px per TikZ cm
    margin = 16,
    maxHeight = 640,        // so that the diagram never overflows the slide
    fontSize = 30,          // the picture's \normalsize
    lineHeight = 1.25,
    labelGap = 0.15,        // more space under a label, in em
    pad = 10,               // TikZ inner sep: between the text and a frame
    gap = 0.3,              // between the ink of a node and its edges, in em
    funnel = [0.8, 1.5, 0.35],  // cm: a funnel's narrow side, wide side, depth
    lineWidth = 1.25,       // frames, funnels and black edges
    accentWidth = 2,        // coloured edges
    arrowSize = 14,         // heads of coloured edges; 0.8 of it on black
                            // ones, 1.6 on double ones
    looseness = 1,          // of bent edges, as in TikZ
    labelSize = 0.7,        // edge labels (\scriptsize), relative to fontSize
    ink = "#222",
    red = "red",
    font = '"Helvetica Neue", Helvetica, Arial, sans-serif',
    weight = 200,           // the slides' light cut
    monoFont = '"Courier New", Courier, monospace',
    mathFont = '"Times New Roman", Times, serif',   // italics of formulas
  } = options;

  const { nodes = [], edges = [] } = spec;
  const [narrow, wide, deep] = funnel.map((cm) => cm * unit);
  const pt = unit / 28.45;  // px per TikZ pt
  const rad = (degrees) => (degrees * Math.PI) / 180;

  const on = (d, level) => level >= (d.stage ?? 1) && level < (d.until ?? Infinity);

  // *italics* and _subscripts, as runs of one style each.
  const parse = (text, sub = false) => {
    const runs = [];
    let plain = "";
    const flush = () => {
      if (plain) runs.push({ text: plain, sub });
      plain = "";
    };
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === "*") {
        const j = text.indexOf("*", i + 1);
        flush();
        runs.push({ text: text.slice(i + 1, j), italic: true, sub });
        i = j;
      } else if (c === "_") {
        const group = text[i + 1] === "{";
        const j = group ? text.indexOf("}", i + 2) : i + 1;
        flush();
        runs.push(...parse(group ? text.slice(i + 2, j) : text[j], true));
        i = j;
      } else {
        plain += c;
      }
    }
    flush();
    return runs;
  };

  // The font of a run. The serif and the typewriter fonts have no light cut,
  // so they are measured, as they are shown, in their regular one, which is
  // also the bold of the light text (as **…** on the slides); a bold
  // typewriter line is in its bold.
  const styleOf = (run, line) => ({
    family: run.italic ? mathFont : line.mono ? monoFont : font,
    italic: Boolean(run.italic),
    weight: line.mono && line.bold ? 700
      : run.italic || line.mono || line.bold ? 400 : weight,
    size: run.sub ? 0.7 * line.size : line.size,
  });

  // Lines are measured on a canvas, which needs no layout: the slide may
  // well be hidden when this runs. A line is drawn on its baseline, `base`
  // under the middle of its row, where CSS would put it: the central
  // baseline of its first run, halfway between its font's ascent and
  // descent, at the middle. Besides its width, its ink: how far it rises
  // above and sinks below the middle, down to the underline of a title; and,
  // for a line of one run, how far right of its anchor the ink is centred.
  const context = document.createElement("canvas").getContext("2d");
  context.textAlign = "center";
  const measure = (line) => {
    const runs = line.runs.map((run) => {
      const s = styleOf(run, line);
      context.font = `${s.italic ? "italic " : ""}${s.weight} ${s.size}px ${s.family}`;
      return { run, size: s.size, m: context.measureText(run.text) };
    });
    const first = runs[0];
    const base = first
      ? ((first.m.fontBoundingBoxAscent ?? 0.9 * first.size)
         - (first.m.fontBoundingBoxDescent ?? 0.25 * first.size)) / 2
      : 0;
    let up = 0, down = 0;
    for (const { run, m } of runs) {
      const lowered = run.sub ? 0.3 * line.size : 0;
      up = Math.max(up, m.actualBoundingBoxAscent - base - lowered);
      down = Math.max(down, m.actualBoundingBoxDescent + base + lowered);
    }
    if (line.title) down = Math.max(down, 0.55 * line.size + 0.75);
    return {
      width: d3.sum(runs, (r) => r.m.width),
      up, down, base,
      center: runs.length === 1
        ? (first.m.actualBoundingBoxRight - first.m.actualBoundingBoxLeft) / 2 : 0,
    };
  };

  // Nodes, in TikZ space (px, y upwards): rows of lines, from the top, each
  // row holding the alternatives that take turns in it, the label's with
  // `labelGap` more space under it; a line's `y` is its middle, from the
  // centre of the node, and its `x` how far right of the centre its anchor
  // is moved.
  // A picture, `width` by `height` cm: a line as high as it is, its ink all
  // of it.
  const pictured = (image) => {
    const width = image.width * unit, height = image.height * unit;
    return {
      ...image, picture: true, width, height, size: height / lineHeight,
      up: height / 2, down: height / 2, base: 0, center: 0,
      page: /\.html?([?#].*)?$/i.test(image.src),
    };
  };

  const shapes = new Map();
  const items = nodes.map((n) => {
    const labelled = Boolean(n.title || n.text);
    const rows = [
      ...(n.title ? [[{ text: n.title, title: true }]] : []),
      ...(n.text ? [[{ text: n.text, plain: true }]] : []),
      ...(n.lines ?? []).map((line) => [line].flat()),
    ].map((row) => row.map((given) => {
      if (given.src) return pictured(given);
      const line = typeof given === "string" ? { text: given } : given;
      const own = !line.title && !line.plain;
      const placed = {
        ...line,
        size: fontSize * (line.size ?? (own ? n.size : 1) ?? 1),
        mono: line.mono ?? (own && n.mono) ?? false,
        color: line.color ?? (own ? n.color : undefined) ?? ink,
        alertAt: line.title ? n.alertAt : undefined,
        runs: parse(line.text),
      };
      return { ...placed, ...measure(placed) };
    }));
    // A picture, under the lines or above them: a row of its own.
    if (n.image) {
      const picture = [pictured(n.image)];
      if (n.image.first) rows.unshift(picture);
      else rows.push(picture);
    }
    // The first row, a label or a picture above the lines, is set off from
    // the rest.
    const sizes = rows.map((row) => d3.max(row, (l) => l.size));
    const setOff = (labelled || n.image?.first) && rows.length > 1;
    const heights = sizes.map((size, r) => lineHeight * size
      + (setOff && r === 0 ? labelGap * size : 0));
    let top = d3.sum(heights) / 2;
    const placedRows = rows.map((row, r) => {
      const y = top - (lineHeight * sizes[r]) / 2;
      top -= heights[r];
      return row.map((l) => ({ ...l, y, x: 0 }));
    });

    // A frame is at least `minWidth` by `minHeight` cm, its text centred
    // from the top of its ink to its baseline, as on a button: a descender
    // hangs below, as the "g" of "Program".
    let lines = placedRows.flat();
    if (n.box) {
      const high = d3.max(lines, (l) => l.y + l.up);
      const low = d3.min(lines, (l) => l.y - l.base);
      lines = lines.map((l) => ({ ...l, y: l.y - (high + low) / 2, x: -l.center }));
    }
    const hw = Math.max((d3.max(lines, (l) => l.width) ?? 0) / 2 + pad,
                        ((n.minWidth ?? 0) * unit) / 2);
    const hh = Math.max(d3.sum(heights) / 2 + pad, ((n.minHeight ?? 0) * unit) / 2);

    // What edges attach to: the frame, or else, `gap` away, the ink of the
    // label, or, with `attach: "all"` or without a label, of the rows that
    // last as long as the node does (filled from its first step, by a line
    // with no stage of its own, to its last, by one with no until).
    let edge = { dy: 0, hw, hh };
    if (!n.box) {
      const lasting = placedRows.filter((row) =>
        row.some((l) => l.stage === undefined) && row.some((l) => l.until === undefined));
      const kept = (labelled && n.attach !== "all" ? placedRows.slice(0, 1)
        : lasting.length ? lasting : placedRows).flat();
      const high = d3.max(kept, (l) => l.y + l.up);
      const low = d3.min(kept, (l) => l.y - l.down);
      const g = gap * fontSize;
      edge = {
        dy: (high + low) / 2,
        hw: d3.max(kept, (l) => l.width) / 2 + g,
        hh: (high - low) / 2 + g,
      };
    }

    // Placed by its centre, or by the centre or an end of what edges attach
    // to.
    const [ref, side] = (n.anchor ?? "").split(" ");
    const [dx, dy] = ref === "edges"
      ? [side === "east" ? edge.hw : side === "west" ? -edge.hw : 0, edge.dy]
      : [0, 0];
    const x = n.at[0] * unit - dx;
    const y = n.at[1] * unit - dy;
    const node = {
      ...n, x, y, hw, hh, lines,
      edge: { x, y: y + edge.dy, hw: edge.hw, hh: edge.hh },
    };
    shapes.set(n.id, node);
    return node;
  });

  // Where a ray from the centre of what edges attach to, at `angle`, crosses
  // its border: the frame, or, through the top or the bottom of a node with
  // funnels, the outer side of the funnel.
  const border = (node, angle) => {
    const { x, y, hw, hh } = node.edge;
    const c = Math.cos(angle), s = Math.sin(angle);
    if (node.funnels) {
      const u = Math.abs((hh + deep) / s);
      if (Math.abs(u * c) <= wide / 2) return [x + u * c, y + u * s];
    }
    const t = Math.min(Math.abs(hw / c), Math.abs(hh / s));
    return [x + t * c, y + t * s];
  };

  // A point of the border: where the ray at an angle crosses it, or the
  // point named as in TikZ, "east", "north west" and the like.
  const pointAt = (node, at) => {
    if (typeof at !== "string") return border(node, at);
    const { x, y, hw, hh } = node.edge;
    return [x + (at.includes("east") ? hw : at.includes("west") ? -hw : 0),
            y + (at.includes("north") ? hh : at.includes("south") ? -hh : 0)];
  };
  const pinned = (node, at) => (at === undefined ? undefined
    : pointAt(node, typeof at === "string" ? at : rad(at)));

  // Edges are drawn as runs of cubic segments, a straight one with its
  // control points a third and two thirds of the way.
  const straight = (p, q) => [p, [p[0] + (q[0] - p[0]) / 3, p[1] + (q[1] - p[1]) / 3],
                              [p[0] + (2 * (q[0] - p[0])) / 3, p[1] + (2 * (q[1] - p[1])) / 3], q];

  // The circular arc from p0 to p3 that leaves p0 across (or up or down),
  // as one cubic segment: a quarter circle when p3 is as far across as up
  // or down, a smaller part of a circle when it is farther across.
  const arc = (p0, p3, across) => {
    const dx = p3[0] - p0[0], dy = p3[1] - p0[1];
    const d = across ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
    const n = across ? [0, Math.sign(dy)] : [Math.sign(dx), 0];
    const along = dx * d[0] + dy * d[1], aside = dx * n[0] + dy * n[1];
    if (aside < 0.5) return straight(p0, p3);
    const turn = 2 * Math.atan2(aside, along);
    const radius = (along * along + aside * aside) / (2 * aside);
    const k = (4 / 3) * Math.tan(turn / 4) * radius;
    const end = [d[0] * Math.cos(turn) + n[0] * Math.sin(turn),
                 d[1] * Math.cos(turn) + n[1] * Math.sin(turn)];
    return [p0, [p0[0] + k * d[0], p0[1] + k * d[1]],
            [p3[0] - k * end[0], p3[1] - k * end[1]], p3];
  };

  // An orthogonal edge, TikZ `-|` (across, then up or down) or `|-` (up or
  // down, then across) with `rounded corners`: from the side of the first
  // node facing the second, or from `fromAt`, to the side of the second it
  // comes in by, or to `toAt`, its corner a quarter circle of `corner` cm,
  // as far as its legs allow; with `corner: true`, the whole edge is one
  // circular arc, leaving along its first leg.
  const orthogonal = (e, a, b, from, to) => {
    const across = e.path === "-|";
    const p0 = from ?? pointAt(a, across
      ? (b.edge.x > a.edge.x ? "east" : "west")
      : (b.edge.y > a.edge.y ? "north" : "south"));
    const p3 = to ?? pointAt(b, across
      ? (p0[1] > b.edge.y ? "north" : "south")
      : (p0[0] > b.edge.x ? "east" : "west"));
    if (e.corner === true) return [arc(p0, p3, across)];
    const knee = across ? [p3[0], p0[1]] : [p0[0], p3[1]];
    const first = Math.hypot(knee[0] - p0[0], knee[1] - p0[1]);
    const second = Math.hypot(p3[0] - knee[0], p3[1] - knee[1]);
    const r = Math.min((e.corner ?? 0) * unit, first, second);
    const d1 = first ? [(knee[0] - p0[0]) / first, (knee[1] - p0[1]) / first] : [0, 0];
    const d2 = second ? [(p3[0] - knee[0]) / second, (p3[1] - knee[1]) / second] : [0, 0];
    const s = [knee[0] - r * d1[0], knee[1] - r * d1[1]];
    const f = [knee[0] + r * d2[0], knee[1] + r * d2[1]];
    const k = 0.5523 * r;   // a quarter circle's control points
    const segments = [
      ...(first - r > 0.5 ? [straight(p0, s)] : []),
      ...(r > 0.5 ? [[s, [s[0] + k * d1[0], s[1] + k * d1[1]],
                      [f[0] - k * d2[0], f[1] - k * d2[1]], f]] : []),
      ...(second - r > 0.5 ? [straight(f, p3)] : []),
    ];
    return segments.length ? segments : [straight(p0, p3)];
  };

  // Edges, as cubic curves from border to border. A bent edge leaves `bend`
  // degrees off the line between its ends and comes back symmetrically: an
  // arc of a circle turning twice `bend`, its control points as far out as
  // a circle's (TikZ puts them 0.3915 of the way out, which only a quarter
  // circle matches), unless `out` or `in` say otherwise, which TikZ's
  // 0.3915 then follows; a straight one has them on the line. As in TikZ,
  // an end that is not given at a point of the border is, for that line,
  // the centre of the node, where the edge then leaves or comes in as its
  // direction says.
  const curves = edges.map((e) => {
    const a = shapes.get(e.from), b = shapes.get(e.to);
    const from = pinned(a, e.fromAt), to = pinned(b, e.toAt);
    const color = e.color ?? ink;
    const width = e.width ?? (color === ink ? lineWidth : accentWidth);
    const edge = {
      ...e,
      style: e.style ?? "solid",
      color,
      width,
      head: arrowSize * (e.style === "double" ? 1.6 : width < accentWidth ? 0.8 : 1),
    };
    if (e.path === "-|" || e.path === "|-") {
      return { ...edge, segments: orthogonal(e, a, b, from, to) };
    }
    const [ax, ay] = from ?? [a.edge.x, a.edge.y];
    const [bx, by] = to ?? [b.edge.x, b.edge.y];
    const toward = Math.atan2(by - ay, bx - ax);
    const bend = rad(e.bend ?? 0);
    const out = e.out === undefined ? toward + bend : rad(e.out);
    const back = e.in === undefined ? toward + Math.PI - bend : rad(e.in);
    const p0 = from ?? border(a, out);
    const p3 = to ?? border(b, back);
    const half = Math.abs(bend);
    const reach = (e.looseness ?? looseness) * Math.hypot(p3[0] - p0[0], p3[1] - p0[1])
      * (e.out !== undefined || e.in !== undefined ? 0.3915
        : half > 1e-3 ? ((2 / 3) * Math.tan(half / 2)) / Math.sin(half) : 1 / 3);
    return {
      ...edge,
      segments: [[
        p0,
        [p0[0] + reach * Math.cos(out), p0[1] + reach * Math.sin(out)],
        [p3[0] + reach * Math.cos(back), p3[1] + reach * Math.sin(back)],
        p3,
      ]],
    };
  });

  const bezier = ([p0, p1, p2, p3], t) => [0, 1].map((k) =>
    (1 - t) ** 3 * p0[k] + 3 * (1 - t) ** 2 * t * p1[k]
    + 3 * (1 - t) * t ** 2 * p2[k] + t ** 3 * p3[k]);
  // The point `t` of the way along a run of segments, by their parameters.
  const along = (segments, t) => {
    const k = Math.min(segments.length - 1, Math.floor(t * segments.length));
    return bezier(segments[k], t * segments.length - k);
  };

  // Labels hang under their point of the curve, one line under the other.
  const labelFont = labelSize * fontSize;
  for (const e of curves.filter((e) => e.label)) {
    const [x, y] = along(e.segments, e.labelAt ?? 0.5);
    e.labelLines = e.label.split("\n").map((text) => {
      const line = { size: labelFont, runs: parse(text) };
      return { ...line, width: measure(line).width };
    });
    e.labelX = x + (e.labelRight ?? 0) * pt;
    e.labelTop = y - (e.labelBelow ?? 0) * pt;
  }

  // The picture's extent, in TikZ space, then the SVG's.
  const xs = [], ys = [];
  for (const n of items) {
    const funnelled = n.funnels ? deep : 0;
    xs.push(n.x - n.hw, n.x + n.hw);
    ys.push(n.y - n.hh - funnelled, n.y + n.hh + funnelled);
  }
  for (const e of curves) {
    for (const segment of e.segments) {
      for (let k = 0; k <= 32; k++) {
        const [x, y] = bezier(segment, k / 32);
        xs.push(x);
        ys.push(y);
      }
    }
    if (e.labelLines) {
      const w = d3.max(e.labelLines, (l) => l.width);
      xs.push(e.labelX - w / 2, e.labelX + w / 2);
      ys.push(e.labelTop - e.labelLines.length * lineHeight * labelFont);
    }
  }
  const x0 = d3.min(xs) - margin, y0 = d3.max(ys) + margin;
  const width = d3.max(xs) + margin - x0;
  const height = y0 - d3.min(ys) + margin;
  const place = ([x, y]) => [x - x0, y0 - y];

  // The paths of an edge in the SVG: the line stops short of the tip, the
  // last control point moved along, so the head ends it in its own direction.
  const outline = (e) => {
    const segments = e.segments.map((segment) => segment.map(place));
    const [p0, p1, p2, p3] = segments[segments.length - 1];
    const size = e.head;
    const angle = Math.atan2(p3[1] - p2[1], p3[0] - p2[0]);
    const short = [0.8 * size * Math.cos(angle), 0.8 * size * Math.sin(angle)];
    const q2 = [p2[0] - short[0], p2[1] - short[1]];
    const q3 = [p3[0] - short[0], p3[1] - short[1]];
    const traced = [...segments.slice(0, -1), [p0, p1, q2, q3]];
    const wing = (s) => [p3[0] - size * Math.cos(angle + s * 0.4),
                         p3[1] - size * Math.sin(angle + s * 0.4)];
    let head = `M${p3}L${wing(1)}L${wing(-1)}Z`;
    // With `both`, the same at the start, pointing back.
    if (e.both) {
      const [s0, s1, s2, s3] = traced[0];
      const back = Math.atan2(s0[1] - s1[1], s0[0] - s1[0]);
      const cut = [0.8 * size * Math.cos(back), 0.8 * size * Math.sin(back)];
      traced[0] = [[s0[0] - cut[0], s0[1] - cut[1]], [s1[0] - cut[0], s1[1] - cut[1]], s2, s3];
      const wing0 = (s) => [s0[0] - size * Math.cos(back + s * 0.4),
                            s0[1] - size * Math.sin(back + s * 0.4)];
      head += `M${s0}L${wing0(1)}L${wing0(-1)}Z`;
    }
    let length = 0;
    for (const segment of traced) {
      let last = segment[0];
      for (let k = 1; k <= 48; k++) {
        const p = bezier(segment, k / 48);
        length += Math.hypot(p[0] - last[0], p[1] - last[1]);
        last = p;
      }
    }
    return {
      line: `M${traced[0][0]}${traced.map(([, c1, c2, q]) => `C${c1} ${c2} ${q}`).join("")}`,
      head,
      length,
    };
  };

  // Writes the runs of a line into a <text>, a tspan each, lowering the
  // subscripts. The weight is set with priority, as measured: the slides
  // make every element inherit theirs.
  const write = (text, line) => {
    let lowered = 0;
    text.selectAll("tspan")
      .data(line.runs)
      .join("tspan")
      .each(function (run) {
        const s = styleOf(run, line);
        const shift = run.sub ? 0.3 * line.size : 0;
        d3.select(this)
          .attr("font-family", s.family)
          .attr("font-style", s.italic ? "italic" : "normal")
          .attr("font-size", s.size)
          .style("font-weight", s.weight, "important")
          .attr("dy", shift - lowered)
          .text(run.text);
        lowered = shift;
      });
  };

  // Draws the diagram into `element`, everything hidden, and returns the
  // function that shows it at a given step.
  const draw = (element) => {
    const svg = d3.select(element)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .style("max-height", `${maxHeight}px`)
      .style("overflow", "visible")
      .style("font-family", font);

    // Edges first, under the nodes. Solid and double ones are drawn, with a
    // dash as long as themselves; dashed ones fade in, whole.
    const drawn = (e) => e.style !== "dashed";
    const edgeGroups = svg.append("g")
      .selectAll("g")
      .data(curves.map((e) => ({ ...e, ...outline(e) })))
      .join("g")
      .attr("opacity", (e) => (drawn(e) ? 1 : 0));

    const edgeLines = edgeGroups.append("path")
      .attr("d", (e) => e.line)
      .attr("fill", "none")
      .attr("stroke", (e) => e.color)
      .attr("stroke-width", (e) => (e.style === "double" ? 6 : e.width))
      .attr("stroke-dasharray", (e) => (drawn(e) ? `${e.length} ${e.length}` : "7 6"))
      .attr("stroke-dashoffset", (e) => (drawn(e) ? e.length : 0));

    // The white core of a double edge, drawn along with it; its end is
    // covered by the head.
    const edgeCores = edgeGroups.filter((e) => e.style === "double")
      .append("path")
      .attr("d", (e) => e.line)
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", (e) => `${e.length} ${e.length}`)
      .attr("stroke-dashoffset", (e) => e.length);

    const edgeHeads = edgeGroups.append("path")
      .attr("d", (e) => e.head)
      .attr("fill", (e) => e.color)
      .attr("opacity", (e) => (drawn(e) ? 0 : 1));

    const edgeLabels = edgeGroups.filter((e) => e.labelLines)
      .append("g")
      .attr("text-anchor", "middle")
      .attr("fill", (e) => e.color)
      .attr("opacity", (e) => (drawn(e) ? 0 : 1));
    edgeLabels.each(function (e) {
      const [x, y] = place([e.labelX, e.labelTop]);
      d3.select(this).selectAll("text")
        .data(e.labelLines)
        .join("text")
        .attr("x", x)
        .attr("y", (l, i) => y + (i + 0.8) * lineHeight * labelFont)
        .each(function (l) { write(d3.select(this), l); });
    });

    const nodeGroups = svg.append("g")
      .selectAll("g")
      .data(items)
      .join("g")
      .attr("transform", (n) => `translate(${place([n.x, n.y])})`)
      .attr("opacity", 0);

    nodeGroups.filter((n) => n.fill && !n.box)
      .append("rect")
      .attr("x", (n) => -n.hw)
      .attr("y", (n) => -n.hh)
      .attr("width", (n) => 2 * n.hw)
      .attr("height", (n) => 2 * n.hh)
      .attr("fill", (n) => n.fill);

    nodeGroups.filter((n) => n.box)
      .append("rect")
      .attr("x", (n) => -n.hw)
      .attr("y", (n) => -n.hh)
      .attr("width", (n) => 2 * n.hw)
      .attr("height", (n) => 2 * n.hh)
      .attr("rx", 10)
      .attr("fill", "white")
      .attr("stroke", ink)
      .attr("stroke-width", lineWidth);

    // A trapezium on each side of the frame, its narrow side against it.
    nodeGroups.filter((n) => n.box && n.funnels)
      .append("path")
      .attr("d", (n) => [-1, 1].map((side) => {
        const near = side * n.hh, far = side * (n.hh + deep);
        return `M${-narrow / 2},${near}L${narrow / 2},${near}`
          + `L${wide / 2},${far}L${-wide / 2},${far}Z`;
      }).join(""))
      .attr("fill", "white")
      .attr("stroke", ink)
      .attr("stroke-width", lineWidth);

    // Every line of every node, alternatives included, each in a group of
    // its own: the alternatives take turns by fading.
    const lineGroups = nodeGroups.selectAll("g")
      .data((n) => n.lines)
      .join("g")
      .attr("opacity", (l) => (l.stage || l.until ? 0 : 1));

    const texts = lineGroups.filter((l) => !l.picture)
      .append("text")
      .attr("x", (l) => l.x)
      .attr("y", (l) => -l.y + l.base)
      .attr("text-anchor", "middle")
      .attr("fill", (l) => l.color)
      .each(function (l) { write(d3.select(this), l); });

    lineGroups.filter((l) => l.picture && !l.page)
      .append("image")
      .attr("href", (l) => l.src)
      .attr("x", (l) => l.x - l.width / 2)
      .attr("y", (l) => -l.y - l.height / 2)
      .attr("width", (l) => l.width)
      .attr("height", (l) => l.height)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const underlines = lineGroups.filter((l) => l.title)
      .append("line")
      .attr("x1", (l) => l.x - l.width / 2)
      .attr("x2", (l) => l.x + l.width / 2)
      .attr("y1", (l) => -l.y + 0.55 * l.size)
      .attr("y2", (l) => -l.y + 0.55 * l.size)
      .attr("stroke", (l) => l.color)
      .attr("stroke-width", 1.5);

    // Edges `over` the nodes are moved above them, and the frames above
    // these edges.
    const above = svg.append("g").node();
    edgeGroups.filter((e) => e.over).each(function () { above.appendChild(this); });
    if (above.hasChildNodes()) {
      const boxes = svg.append("g").node();
      nodeGroups.filter((n) => n.box).each(function () { boxes.appendChild(this); });
    }

    // A page, in a frame over the SVG rather than in it (where browsers do
    // not all place a frame right), cut to `view` and scaled down to the
    // picture's place. That place, in the CSS px of the container, depends
    // on the size the SVG is given, known only once the slide is displayed
    // (reveal.js hides the slides far from the current one): the frame is
    // placed then, and its page loaded. It fades with its node and its row.
    const frames = d3.select(element)
      .selectAll("div")
      .data(items.flatMap((n) => n.lines.filter((l) => l.page).map((l) => ({
        ...l,
        stage: Math.max(n.stage ?? 1, l.stage ?? 1),
        until: Math.min(n.until ?? Infinity, l.until ?? Infinity),
        middle: place([n.x + l.x, n.y + l.y]),
        view: l.view ?? [0, 0, l.width, l.height],
      }))))
      .join("div")
      .style("position", "absolute")
      .style("overflow", "hidden")
      .style("opacity", 0);
    frames.append("iframe")
      .attr("scrolling", "no")
      .style("position", "absolute")
      .style("left", 0)
      .style("top", 0)
      .style("border", 0)
      .style("max-width", "none")   // reveal.js keeps iframes to 95%
      .style("max-height", "none")
      .style("transform-origin", "0 0")
      .style("width", (f) => `${f.view[0] + f.view[2]}px`)
      .style("height", (f) => `${f.view[1] + f.view[3]}px`);
    const fit = () => {
      const w = svg.node().clientWidth, h = svg.node().clientHeight;
      if (!w || !h) return;
      const k = Math.min(w / width, h / height);  // CSS px per px of the SVG
      frames.each(function (f) {
        const [x, y, vw, vh] = f.view;
        const s = k * Math.min(f.width / vw, f.height / vh);
        const frame = d3.select(this)
          .style("left", `${(w - k * width) / 2 + k * f.middle[0] - (s * vw) / 2}px`)
          .style("top", `${(h - k * height) / 2 + k * f.middle[1] - (s * vh) / 2}px`)
          .style("width", `${s * vw}px`)
          .style("height", `${s * vh}px`);
        const page = frame.select("iframe")
          .style("transform", `scale(${s}) translate(${-x}px, ${-y}px)`);
        if (!page.attr("src")) page.attr("src", f.src);
      });
    };
    if (!frames.empty()) {
      if (getComputedStyle(element).position === "static") {
        element.style.position = "relative";
      }
      new ResizeObserver(fit).observe(svg.node());
    }

    let level = 0;
    return (next, animate = true) => {
      if (next === level) return;
      const before = level;
      level = next;
      const forward = level > before;
      const move = (selection, name, duration, delay = 0) => (animate
        ? selection.transition(name).delay(delay).duration(duration)
          .ease(d3.easeCubicInOut)
        : selection);
      const shown = (d) => on(d, level);
      const coming = (d) => shown(d) && !on(d, before);
      const going = (d) => !shown(d) && on(d, before);
      const alerted = (l) => level >= (l.alertAt ?? Infinity);

      // What leaves goes first, in `out` ms, and what comes only then, so
      // that nothing crosses what it replaces: a "?" the word in its place,
      // an arrow the "?" it is drawn through. Parts of several steps that
      // come together (coming back onto the slide) come one step after the
      // other; edges wait for their nodes.
      const out = 300;
      const parts = [...items, ...items.flatMap((n) => n.lines), ...curves];
      const clear = parts.some(going) ? out : 0;
      const turn = (d) => (coming(d)
        ? clear + (forward ? Math.max(0, (d.stage ?? 1) - before - 1) * 350 : 0)
        : 0);
      const fade = (d) => (going(d) ? out : 400);

      move(nodeGroups, "show", fade, turn)
        .attr("opacity", (n) => (shown(n) ? 1 : 0));
      move(lineGroups, "show", fade, turn)
        .attr("opacity", (l) => (shown(l) ? 1 : 0));
      move(frames, "show", fade, turn)
        .style("opacity", (f) => (shown(f) ? 1 : 0));
      frames.style("pointer-events", (f) => (shown(f) ? null : "none"));
      move(texts.filter((l) => l.alertAt), "alert", 400, clear)
        .attr("fill", (l) => (alerted(l) ? red : l.color));
      move(underlines.filter((l) => l.alertAt), "alert", 400, clear)
        .attr("stroke", (l) => (alerted(l) ? red : l.color));

      const wait = (e) => turn(e) + (coming(e) && forward ? 200 : 0);
      const trace = (e) => (going(e) ? out : 600);
      const tip = (e) => (coming(e) ? wait(e) + 450 : 0);
      move(edgeLines.filter(drawn), "draw", trace, wait)
        .attr("stroke-dashoffset", (e) => (shown(e) ? 0 : e.length));
      move(edgeCores, "draw", trace, wait)
        .attr("stroke-dashoffset", (e) => (shown(e) ? 0 : e.length));
      move(edgeHeads.filter(drawn), "head", 250, tip)
        .attr("opacity", (e) => (shown(e) ? 1 : 0));
      move(edgeLabels.filter(drawn), "head", 250, tip)
        .attr("opacity", (e) => (shown(e) ? 1 : 0));
      move(edgeGroups.filter((e) => !drawn(e)), "show", fade, wait)
        .attr("opacity", (e) => (shown(e) ? 1 : 0));
    };
  };

  // Follow the steps' `visible` class, whatever changed it (next/prev,
  // jumping to the slide, overview mode).
  const update = draw(document.querySelector(container));
  const stepNodes = steps.map((s) => document.querySelector(s));
  const sync = () =>
    update(stepNodes.filter((n) => n.classList.contains("visible")).length);
  const observer = new MutationObserver(sync);
  for (const n of stepNodes) {
    observer.observe(n, { attributes: true, attributeFilter: ["class"] });
  }
  sync();

  // A frame takes the keys once it is clicked, and reveal.js would no longer
  // hear them: they are given back to the slides at once, the pages shown
  // here needing only the mouse.
  if (items.some((n) => n.lines.some((l) => l.page))) {
    window.addEventListener("blur", () => setTimeout(() => {
      const active = document.activeElement;
      if (active?.tagName === "IFRAME" && active.closest(container)) {
        active.blur();
        window.focus();
      }
    }));
  }

  // In print view, reveal.js lays the slides out as pages after this has
  // run, copying a slide once per fragment: once it is done, each copy of
  // the diagram is drawn anew at the step of its page, without transitions.
  // A step that is not a fragment (made visible when the slide comes) counts
  // as visible on every page.
  if (/print-pdf/gi.test(window.location.search)) {
    document.querySelector(".reveal")?.addEventListener("pdf-ready", () => {
      for (const element of document.querySelectorAll(container)) {
        const page = element.closest(".pdf-page") ?? document;
        const level = steps.filter((s) => {
          const step = page.querySelector(s);
          return step && (step.classList.contains("visible")
                          || !step.classList.contains("fragment"));
        }).length;
        d3.select(element).selectChildren().remove();
        draw(element)(level, false);
      }
    });
  }
}
