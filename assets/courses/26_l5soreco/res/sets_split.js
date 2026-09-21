// Set diagram for reveal.js slides, drawn with D3.
//
// setsSplit(container, groups, steps, options) draws the labels of `groups`
// (an array of four arrays) in one universal set, one step per reveal.js
// fragment in `steps`:
//
//   step 1  the labels appear, scattered at random;
//   step 2  the line of the universal set is drawn around them;
//   step 3  four subsets appear (top, right, bottom, left) and each label
//           moves into its subset, in order;
//   step 4+ layers of double-headed arrows, from `options.arrows`.
//
// Each arrow layer is shown from step `show` up to, not including, step
// `hide` (if any), in its own `color`, and is either
//
//   {cycle: [labels]}    each label linked to the next, the last to the
//                        first, curved away from the cycle's centre;
//   {closure: [labels]}  the pairs the cycle through `labels` lacks for its
//                        transitive closure (reflexive pairs aside).
//
// Going back through the fragments undoes each step.
//
//   <div id="sets"></div>
//   <div class="fragment" id="sets-1"></div>
//   ...
//   <div class="fragment" id="sets-5"></div>
//   <script>setsSplit("#sets", [["a"], ["b"], ["c"], ["d"]],
//                     ["#sets-1", "#sets-2", "#sets-3", "#sets-4", "#sets-5"],
//                     {arrows: [{cycle: ["a", "b", "c", "d"], show: 4},
//                               {closure: ["a", "b", "c", "d"], show: 5}]});</script>

function setsSplit(container, groups, steps, options = {}) {
  const {
    width = 1100,
    height = 600,
    fontSize = 19,
    seed = 7,               // same scatter at every load
    shift = 75,             // top subset moves left, bottom one right
    arrows = [],            // arrow layers, see above
    bend = 0.3,             // arrow curvature; negative bends inwards
    navy = "#1d2769",
    yellow = "#fab600",
  } = options;

  const margin = 10;
  const pad = 14;
  const charWidth = 0.6 * fontSize;   // Courier New advance width
  const dotRadius = 5;
  const dotGap = 8;
  const rowHeight = 2.4 * fontSize;

  const labelWidth = (label) => 2 * dotRadius + dotGap + label.length * charWidth;

  const items = groups.flatMap((labels, g) =>
    labels.map((label, k) => ({ label, g, k, w: labelWidth(label) }))
  );

  // Subsets: one ellipse size for all, just big enough for the longest
  // column at its top and bottom rows.
  const inner = width - 2 * margin;
  const columnWidths = groups.map((labels) => d3.max(labels, labelWidth));
  const rows = d3.max(groups, (labels) => labels.length);
  const halfRows = (rows - 1) / 2 * rowHeight;
  const ry = rows * rowHeight / 2 + 45;
  const rx = (d3.max(columnWidths) / 2 + 18) / Math.sqrt(1 - (halfRows / ry) ** 2);

  const edge = margin + pad;
  const subsets = [
    { cx: width / 2 - shift, cy: edge + ry },            // top
    { cx: width - edge - rx, cy: height / 2 },           // right
    { cx: width / 2 + shift, cy: height - edge - ry },   // bottom
    { cx: edge + rx, cy: height / 2 },                   // left
  ];

  // Target: a left-aligned column, centred in the item's subset.
  for (const d of items) {
    const s = subsets[d.g];
    const n = groups[d.g].length;
    d.tx = s.cx - columnWidths[d.g] / 2;
    d.ty = s.cy + (d.k - (n - 1) / 2) * rowHeight;
  }

  // Start: random, non-overlapping positions inside the universal set,
  // shown in random order.
  const random = d3.randomLcg(seed);
  const placed = [];
  for (const d of items) {
    let tries = 0;
    do {
      d.x0 = edge + random() * (inner - 2 * pad - d.w);
      d.y0 = edge + fontSize + random() * (height - 2 * edge - 2 * fontSize);
      tries++;
    } while (
      tries < 2000 &&
      placed.some((p) =>
        d.x0 < p.x0 + p.w + pad && p.x0 < d.x0 + d.w + pad &&
        Math.abs(d.y0 - p.y0) < fontSize + pad)
    );
    placed.push(d);
  }
  d3.shuffle(items.slice(), random).forEach((d, i) => (d.order = i));

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .style("font-family", '"Courier New", Courier, monospace')
    .style("font-size", `${fontSize}px`);

  // Universal set, drawn with a dash as long as its outline.
  const corner = 40;
  const boxWidth = inner;
  const boxHeight = height - 2 * margin;
  const perimeter = 2 * (boxWidth + boxHeight) - 8 * corner + 2 * Math.PI * corner;
  const universe = svg.append("rect")
    .attr("x", margin).attr("y", margin)
    .attr("width", boxWidth).attr("height", boxHeight)
    .attr("rx", corner)
    .attr("fill", "none")
    .attr("stroke", navy)
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", `${perimeter} ${perimeter}`)
    .attr("stroke-dashoffset", perimeter);

  const subsetShapes = svg.append("g")
    .selectAll("ellipse")
    .data(subsets)
    .join("ellipse")
    .attr("cx", (s) => s.cx).attr("cy", (s) => s.cy)
    .attr("rx", rx).attr("ry", ry)
    .attr("fill", yellow).attr("fill-opacity", 0.12)
    .attr("stroke", yellow)
    .attr("stroke-width", 3)
    .attr("opacity", 0);

  const nodes = svg.append("g")
    .selectAll("g")
    .data(items)
    .join("g")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
    .attr("opacity", 0);

  nodes.append("circle")
    .attr("cx", dotRadius)
    .attr("r", dotRadius)
    .attr("fill", navy);

  nodes.append("text")
    .attr("x", 2 * dotRadius + dotGap)
    .attr("dy", "0.35em")
    .attr("fill", navy)
    .text((d) => d.label);

  // Arrows: each link between two labels is a quadratic curve ending at the
  // left or right end of each label (the end facing the curve), so it never
  // comes in through neighbouring rows.
  const byLabel = new Map(items.map((d) => [d.label, d]));
  const middle = (d) => ({ x: d.tx + d.w / 2, y: d.ty });
  const side = (d, c) => (c.x < middle(d).x ? -1 : 1);
  const end = (d, c, offset = 0) => ({
    x: middle(d).x + side(d, c) * (d.w / 2 + 8),
    y: d.ty + offset,
  });
  const control = (a, b, k) => {
    const pa = middle(a), pb = middle(b);
    return {
      x: (pa.x + pb.x) / 2 - (pb.y - pa.y) * k,
      y: (pa.y + pb.y) / 2 + (pb.x - pa.x) * k,
    };
  };
  const bezier = (p, c, q, t) => ({
    x: (1 - t) ** 2 * p.x + 2 * (1 - t) * t * c.x + t ** 2 * q.x,
    y: (1 - t) ** 2 * p.y + 2 * (1 - t) * t * c.y + t ** 2 * q.y,
  });
  const crossings = (a, b, c) => {
    const p = end(a, c), q = end(b, c);
    return d3.sum(d3.range(1, 40), (k) => {
      const u = bezier(p, c, q, k / 40);
      return items.some((d) => d !== a && d !== b &&
        u.x > d.tx - 6 && u.x < d.tx + d.w + 6 &&
        Math.abs(u.y - d.ty) < 0.7 * fontSize) ? 1 : 0;
    });
  };

  const links = arrows.flatMap((layer) => {
    const ds = (layer.cycle || layer.closure).map((label) => byLabel.get(label));
    const n = ds.length;
    const centre = { x: d3.mean(ds, (d) => middle(d).x), y: d3.mean(ds, (d) => middle(d).y) };
    const style = { show: layer.show, hide: layer.hide ?? Infinity, color: layer.color ?? navy };
    if (layer.cycle) {
      return ds.map((a, i) => {
        const b = ds[(i + 1) % n];
        const pa = middle(a), pb = middle(b);
        const outwards = (pa.y - pb.y) * ((pa.x + pb.x) / 2 - centre.x) +
          (pb.x - pa.x) * ((pa.y + pb.y) / 2 - centre.y) >= 0;
        return { a, b, c: control(a, b, outwards ? bend : -bend), ...style };
      });
    }
    // Every label of a cycle reaches every other one, so the closure adds
    // the pairs that are not next to each other, bowed whichever way crosses
    // fewest other labels.
    return ds.flatMap((a, i) => ds.slice(i + 2, i === 0 ? n - 1 : n).map((b) => {
      const k = d3.least([0, 0.1, -0.1, 0.2, -0.2, 0.3, -0.3],
        (k) => crossings(a, b, control(a, b, k)) + Math.abs(k));
      return { a, b, c: control(a, b, k), ...style };
    }));
  });

  // Several arrows at the same end of a label are stacked, top to bottom in
  // the order they arrive.
  const ends = links.flatMap((l) => [
    { l, key: "p", d: l.a }, { l, key: "q", d: l.b },
  ]);
  for (const group of d3.group(ends, (e) => e.d, (e) => side(e.d, e.l.c)).values()) {
    for (const stack of group.values()) {
      stack.sort((e, f) => e.l.c.y - f.l.c.y);
      stack.forEach((e, i) => {
        e.l[e.key] = end(e.d, e.l.c, (i - (stack.length - 1) / 2) * 12);
      });
    }
  }

  const arrowSize = 14;
  const head = (tip, from) => {
    const a = Math.atan2(tip.y - from.y, tip.x - from.x);
    const corner = (s) => [
      tip.x - arrowSize * Math.cos(a + s * 0.45),
      tip.y - arrowSize * Math.sin(a + s * 0.45),
    ];
    return `M${tip.x},${tip.y}L${corner(1)}L${corner(-1)}Z`;
  };
  for (const [, together] of d3.group(links, (l) => l.show)) {
    together.forEach((l, i) => {
      const { p, c, q } = l;
      l.line = `M${p.x},${p.y}Q${c.x},${c.y} ${q.x},${q.y}`;
      l.heads = head(p, c) + head(q, c);
      // Sampled length of the curve, for the drawing animation.
      l.length = d3.sum(d3.range(1, 41), (k) => {
        const u = bezier(p, c, q, (k - 1) / 40), v = bezier(p, c, q, k / 40);
        return Math.hypot(v.x - u.x, v.y - u.y);
      });
      l.delay = 300 + i * Math.min(250, 1800 / together.length);
    });
  }

  const arrowGroups = svg.append("g")
    .selectAll("g")
    .data(links)
    .join("g");
  const arrowLines = arrowGroups.append("path")
    .attr("d", (d) => d.line)
    .attr("fill", "none")
    .attr("stroke", (d) => d.color)
    .attr("stroke-width", 2.5)
    .attr("stroke-dasharray", (d) => `${d.length} ${d.length}`)
    .attr("stroke-dashoffset", (d) => d.length);
  const arrowHeads = arrowGroups.append("path")
    .attr("d", (d) => d.heads)
    .attr("fill", (d) => d.color)
    .attr("opacity", 0);

  // Each step has its own named transition, so a later step does not cut
  // an earlier one short.
  let level = 0;
  const update = (next) => {
    if (next === level) return;
    const forward = next > level;
    level = next;

    nodes.transition("appear")
      .delay((d) => (forward ? d.order * 50 : 0))
      .duration(400)
      .attr("opacity", level >= 1 ? 1 : 0);

    universe.transition("draw")
      .duration(forward ? 1200 : 400)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", level >= 2 ? 0 : perimeter);

    const split = level >= 3;
    subsetShapes.transition("subsets")
      .delay(split ? 0 : 600)
      .duration(600)
      .attr("opacity", split ? 1 : 0);
    nodes.transition("move")
      .delay((d) => (split ? 300 + d.g * 150 : 0))
      .duration(1200)
      .ease(d3.easeCubicInOut)
      .attr("transform", (d) =>
        split ? `translate(${d.tx},${d.ty})` : `translate(${d.x0},${d.y0})`);

    const shown = (d) => level >= d.show && level < d.hide;
    arrowLines.transition("arrows")
      .delay((d) => (shown(d) ? d.delay : 0))
      .duration((d) => (shown(d) ? 700 : 300))
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", (d) => (shown(d) ? 0 : d.length));
    arrowHeads.transition("arrows")
      .delay((d) => (shown(d) ? d.delay + 500 : 0))
      .duration((d) => (shown(d) ? 300 : 150))
      .attr("opacity", (d) => (shown(d) ? 1 : 0));
  };

  // Follow the fragments' `visible` class, whatever changed it (next/prev,
  // jumping to the slide, overview mode).
  const stepNodes = steps.map((s) => document.querySelector(s));
  const sync = () =>
    update(stepNodes.filter((n) => n.classList.contains("visible")).length);
  const observer = new MutationObserver(sync);
  for (const n of stepNodes) {
    observer.observe(n, { attributes: true, attributeFilter: ["class"] });
  }
  sync();
}
