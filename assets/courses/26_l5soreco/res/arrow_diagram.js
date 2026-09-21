// Arrow diagram of an application, for reveal.js slides, drawn with D3.
//
// arrowDiagram(container, spec, steps, options) draws two framed columns of
// labelled points — the departure set on the left, the arrival set on the
// right — and one arrow per pair of `spec.links`:
//
//   spec.departure  ["a", "b", ...]       points of the departure set,
//                                         top to bottom, labelled on the left;
//   spec.arrival    ["1", "2", ...]       points of the arrival set,
//                                         top to bottom, labelled on the right;
//   spec.links      [["a", "2"], ...]     one arrow per pair;
//   spec.setLabels  ["A", "B"]            names written above each frame,
//                                         in serif italic;
//   spec.groups     [{side, members, label}]
//                                         parts to ring inside a frame, with a
//                                         dashed outline: `side` is "departure"
//                                         or "arrival", `members` the points it
//                                         holds — neighbours in their column —
//                                         and `label`, if any, is written above
//                                         it;
//   spec.caption    "..."                 one line under the diagram, wrapped
//                                         at `options.maxChars`.
//
// Everything is drawn as soon as the first fragment of `steps` is visible:
// the two frames are traced, the points appear, the arrows are drawn one after
// the other, then the groups and the caption fade in. Going back through the
// fragments undoes each step.
//
//   <div class="fragment" id="appl"></div>
//   <script>arrowDiagram("#appl",
//                        {departure: ["a", "b"], arrival: ["1", "2"],
//                         links: [["a", "2"], ["b", "2"]]},
//                        ["#appl"]);</script>

function arrowDiagram(container, spec, steps, options = {}) {
  const {
    width = 560,
    height = 620,
    maxHeight = 600,        // so that the diagram never overflows the slide
    fontSize = 26,
    labelSize = 34,         // set names, above each frame
    captionSize = 21,
    maxChars = 52,          // wrap the caption at spaces
    captionRows = 3,        // room kept for the caption, however long it is,
                            // so that overlaid diagrams keep the same frames
    margin = 14,
    frameWidth = 150,       // width of each of the two frames
    framePad = 40,          // above the first point of a column, below the last
    rowHeight = 62,         // between two points of a column
    navy = "#1d2769",
    yellow = "#fab600",
    red = "#d52b1e",        // the parts ringed by `spec.groups`
    // the slide's own font, for the caption
    mainFont = 'var(--r-main-font, "Helvetica Neue", Helvetica, Arial, sans-serif)',
  } = options;

  const {
    departure = [],
    arrival = [],
    links = [],
    setLabels = ["A", "B"],
    groups = [],
    caption = "",
  } = spec;

  const dotRadius = 6;
  const dotGap = 12;
  const lineHeight = 1.3 * captionSize;

  const captionLines = caption.split(" ").reduce((lines, word) => {
    const last = lines[lines.length - 1];
    if (last && (last + " " + word).length <= maxChars) {
      lines[lines.length - 1] = last + " " + word;
    } else {
      lines.push(word);
    }
    return lines;
  }, []);

  // Two frames side by side, each just tall enough for its own column, both
  // centred on the same line so that overlaid diagrams keep their points in
  // register; the caption goes underneath, in a fixed space.
  const captionHeight = caption ? captionRows * lineHeight : 0;
  const top = margin + labelSize + 12;
  const bottom = height - margin - (captionHeight ? captionHeight + 14 : 0);
  const middle = (top + bottom) / 2;
  const frameHeight = (labels) =>
    Math.min(bottom - top, (labels.length - 1) * rowHeight + 2 * framePad);
  const frames = [
    { x: margin + 26, label: setLabels[0], h: frameHeight(departure) },
    { x: width - margin - 26 - frameWidth, label: setLabels[1],
      h: frameHeight(arrival) },
  ].map((f) => ({ ...f, y: middle - f.h / 2, w: frameWidth }));

  // Points: a column centred in its frame, the label outside, facing away.
  const column = (labels, frame, dir) =>
    labels.map((label, k) => ({
      label,
      dir,                                   // -1 label on the left, +1 right
      x: frame.x + frame.w / 2 - dir * 18,
      y: middle + (k - (labels.length - 1) / 2) * rowHeight,
    }));
  const items = [
    ...column(departure, frames[0], -1),
    ...column(arrival, frames[1], +1),
  ];

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .style("max-height", `${maxHeight}px`)
    .style("font-family", '"Courier New", Courier, monospace')
    .style("font-size", `${fontSize}px`);

  // Frames, drawn with a dash as long as their outline.
  const corner = 30;
  const perimeter = (f) =>
    2 * (f.w + f.h) - 8 * corner + 2 * Math.PI * corner;

  const frameGroups = svg.append("g")
    .selectAll("g")
    .data(frames)
    .join("g");

  const frameFills = frameGroups.append("rect")
    .attr("x", (f) => f.x).attr("y", (f) => f.y)
    .attr("width", (f) => f.w).attr("height", (f) => f.h)
    .attr("rx", corner)
    .attr("fill", yellow)
    .attr("fill-opacity", 0);

  const frameLines = frameGroups.append("rect")
    .attr("x", (f) => f.x).attr("y", (f) => f.y)
    .attr("width", (f) => f.w).attr("height", (f) => f.h)
    .attr("rx", corner)
    .attr("fill", "none")
    .attr("stroke", yellow)
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", (f) => `${perimeter(f)} ${perimeter(f)}`)
    .attr("stroke-dashoffset", perimeter);

  const frameLabels = frameGroups.append("text")
    .attr("x", (f) => f.x + f.w / 2)
    .attr("y", (f) => f.y - 14)
    .attr("text-anchor", "middle")
    .attr("fill", navy)
    .attr("font-family", '"Times New Roman", Times, serif')
    .attr("font-size", labelSize)
    .attr("font-style", "italic")
    .attr("opacity", 0)
    .text((f) => f.label);

  // Parts of a set, ringed inside their frame with a dashed outline: the image
  // of an application in its arrival set, its classes in the departure set.
  const inGroup = (g) => {
    const dir = g.side === "arrival" ? 1 : -1;
    const held = items.filter((d) => d.dir === dir && g.members.includes(d.label));
    const frame = frames[dir < 0 ? 0 : 1];
    return {
      ...g,
      x: frame.x + 11,
      w: frame.w - 22,
      y: d3.min(held, (d) => d.y) - 25,
      h: d3.max(held, (d) => d.y) - d3.min(held, (d) => d.y) + 50,
    };
  };

  const groupGroups = svg.append("g")
    .selectAll("g")
    .data(groups.map(inGroup))
    .join("g")
    .attr("opacity", 0);

  groupGroups.append("rect")
    .attr("x", (g) => g.x).attr("y", (g) => g.y)
    .attr("width", (g) => g.w).attr("height", (g) => g.h)
    .attr("rx", 24)
    .attr("fill", red)
    .attr("fill-opacity", 0.08)
    .attr("stroke", red)
    .attr("stroke-width", 2.5)
    .attr("stroke-dasharray", "9 7");

  groupGroups.filter((g) => g.label).append("text")
    .attr("x", (g) => g.x + g.w / 2)
    .attr("y", (g) => g.y - 12)
    .attr("text-anchor", "middle")
    .attr("fill", red)
    .attr("font-family", '"Times New Roman", Times, serif')
    .attr("font-size", 0.8 * labelSize)
    .attr("font-style", "italic")
    .text((g) => g.label);

  const nodes = svg.append("g")
    .selectAll("g")
    .data(items)
    .join("g")
    .attr("transform", (d) => `translate(${d.x},${d.y})`)
    .attr("opacity", 0);

  nodes.append("circle")
    .attr("r", dotRadius)
    .attr("fill", navy);

  nodes.append("text")
    .attr("x", (d) => d.dir * (dotRadius + dotGap))
    .attr("dy", "0.35em")
    .attr("text-anchor", (d) => (d.dir < 0 ? "end" : "start"))
    .attr("fill", navy)
    .text((d) => d.label);

  // Arrows: straight, from the right of a departure point to the left of an
  // arrival point. Arrows landing on the same point are spread over its left
  // side so their heads stay apart.
  const byLabel = new Map();
  for (const d of items) byLabel.set(`${d.dir < 0 ? "A" : "B"}:${d.label}`, d);

  const spread = 11;
  const arrivals = d3.group(links, ([, to]) => to);
  const rank = new Map();
  for (const [, together] of arrivals) {
    together.sort((l, m) =>
      byLabel.get(`A:${l[0]}`).y - byLabel.get(`A:${m[0]}`).y);
    together.forEach((l, i) => rank.set(l, i - (together.length - 1) / 2));
  }

  const arrowSize = 16;
  const edges = links.map((link) => {
    const [from, to] = link;
    const a = byLabel.get(`A:${from}`), b = byLabel.get(`B:${to}`);
    const p = { x: a.x + dotRadius + 10, y: a.y };
    const q = { x: b.x - dotRadius - 10, y: b.y + rank.get(link) * spread };
    const angle = Math.atan2(q.y - p.y, q.x - p.x);
    const wing = (s) => [
      q.x - arrowSize * Math.cos(angle + s * 0.4),
      q.y - arrowSize * Math.sin(angle + s * 0.4),
    ];
    return {
      line: `M${p.x},${p.y}L${q.x},${q.y}`,
      head: `M${q.x},${q.y}L${wing(1)}L${wing(-1)}Z`,
      length: Math.hypot(q.x - p.x, q.y - p.y),
      order: a.y,
    };
  });
  edges.sort((e, f) => e.order - f.order).forEach((e, i) => (e.delay = i * 180));

  const arrowGroups = svg.append("g")
    .selectAll("g")
    .data(edges)
    .join("g");

  const arrowLines = arrowGroups.append("path")
    .attr("d", (e) => e.line)
    .attr("fill", "none")
    .attr("stroke", navy)
    .attr("stroke-width", 2.5)
    .attr("stroke-dasharray", (e) => `${e.length} ${e.length}`)
    .attr("stroke-dashoffset", (e) => e.length);

  const arrowHeads = arrowGroups.append("path")
    .attr("d", (e) => e.head)
    .attr("fill", navy)
    .attr("opacity", 0);

  const captionText = svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin - captionHeight + lineHeight / 2)
    .attr("text-anchor", "middle")
    .attr("fill", navy)
    .style("font-family", mainFont)
    .attr("font-size", captionSize)
    .attr("font-style", "italic")
    .attr("opacity", 0);
  captionText.selectAll("tspan")
    .data(captionLines)
    .join("tspan")
    .attr("x", width / 2)
    .attr("dy", (line, i) => (i ? lineHeight : 0))
    .text((line) => line);

  // Each part has its own named transition, so a later one does not cut an
  // earlier one short.
  const drawn = 400 + edges.length * 180;
  let level = 0;
  const update = (next) => {
    if (next === level) return;
    const forward = next > level;
    level = next;
    const shown = level >= 1;

    frameLines.transition("draw")
      .duration(forward ? 1000 : 400)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", (f) => (shown ? 0 : perimeter(f)));
    frameFills.transition("fill")
      .delay(shown && forward ? 500 : 0)
      .duration(600)
      .attr("fill-opacity", shown ? 0.12 : 0);
    frameLabels.transition("label")
      .delay(shown && forward ? 700 : 0)
      .duration(400)
      .attr("opacity", shown ? 1 : 0);

    nodes.transition("appear")
      .delay((d, i) => (shown && forward ? 400 + i * 45 : 0))
      .duration(400)
      .attr("opacity", shown ? 1 : 0);

    arrowLines.transition("arrows")
      .delay((e) => (shown && forward ? 900 + e.delay : 0))
      .duration(shown ? 600 : 300)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", (e) => (shown ? 0 : e.length));
    groupGroups.transition("groups")
      .delay((g, i) => (shown && forward ? 900 + drawn + i * 250 : 0))
      .duration(500)
      .attr("opacity", shown ? 1 : 0);

    arrowHeads.transition("arrows")
      .delay((e) => (shown && forward ? 1300 + e.delay : 0))
      .duration(shown ? 300 : 150)
      .attr("opacity", shown ? 1 : 0);

    captionText.transition("caption")
      .delay(shown && forward ? 900 + drawn + groups.length * 250 : 0)
      .duration(400)
      .attr("opacity", shown ? 1 : 0);
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
