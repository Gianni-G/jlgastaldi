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
//   spec.name       "f"                   what the arrows stand for, written
//                                         between the two frames, as high as
//                                         their names, in serif italic;
//   spec.caption    "..."                 one line under the diagram, wrapped
//                                         at `options.maxChars`;
//   spec.then       {departure, arrival, caption}
//                                         the same points in another order,
//                                         either column left as it was if not
//                                         given, and the caption to show then:
//                                         the arrangement of the second step;
//   spec.stages     [{links, groups, name, caption, departure, arrival}]
//                                         in place of `links`, `groups`, `name`
//                                         and `caption`: one bundle of arrows,
//                                         of groups, a name and a caption per
//                                         fragment of `steps`, the frames and
//                                         the points being drawn once; a stage
//                                         may put the same points in another
//                                         order; a stage without `links`,
//                                         `name`, `departure` or `arrival`
//                                         keeps those of the one before.
//
// Everything is drawn as soon as the first fragment of `steps` is visible:
// the two frames are traced, the points appear, the arrows are drawn one after
// the other, then the groups and the caption fade in. With `spec.then`, the
// second fragment of `steps` slides the points to their new places, the arrows
// following them, and swaps the caption; the groups stay where they were
// ringed, so the two are not meant to go together. With `spec.stages`, each
// further fragment only withdraws the arrows the next stage lacks, draws those
// it adds, and swaps the groups, the name and the caption — sliding the points
// first, if the stage orders them otherwise, and ringing the groups where they
// have come; `spec.then` is not meant to go with it either.
// Going back through the fragments undoes each step.
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
    name = "",
    then = null,
  } = spec;
  // A stage that gives no arrows, no name or no order keeps those of the
  // stage before.
  let kept = [], keptName = "", keptOrder = [departure, arrival];
  const stages = (spec.stages ?? [{ links, caption, groups, name }])
    .map((stage) => {
      kept = stage.links ?? kept;
      keptName = stage.name ?? keptName;
      keptOrder = [stage.departure ?? keptOrder[0], stage.arrival ?? keptOrder[1]];
      return { ...stage, links: kept, name: keptName, order: keptOrder };
    });

  const dotRadius = 6;
  const dotGap = 12;
  const lineHeight = 1.3 * captionSize;

  const wrap = (text) => text.split(" ").reduce((lines, word) => {
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
  const captionHeight = stages.some((t) => t.caption) || then?.caption
    ? captionRows * lineHeight : 0;
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
  const arrange = ([dep, arr]) => [
    ...column(dep, frames[0], -1),
    ...column(arr, frames[1], +1),
  ];
  const items = arrange([departure, arrival]);

  // Where each point stands at each stage, `ys[t]`, and in the second
  // arrangement, if any, `y1`.
  const heightIn = (placed, d) =>
    placed.find((e) => e.dir === d.dir && e.label === d.label).y;
  const placings = stages.map((stage) => arrange(stage.order));
  const later = then && arrange([then.departure ?? departure,
                                 then.arrival ?? arrival]);
  for (const d of items) {
    d.ys = placings.map((placed) => heightIn(placed, d));
    d.y = d.ys[0];
    d.y1 = later ? heightIn(later, d) : d.y;
  }
  // Whether the points move from stage t - 1 to stage t.
  const reordered = stages.map((stage, t) =>
    t > 0 && items.some((d) => d.ys[t] !== d.ys[t - 1]));

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

  // The name of the arrows, between the frames, as high as the higher of
  // their names: one text per distinct name, so that a name shared by two
  // stages in a row stays put.
  const names = svg.append("g")
    .selectAll("text")
    .data([...new Set(stages.map((stage) => stage.name).filter((n) => n))])
    .join("text")
    .attr("x", width / 2)
    .attr("y", d3.min(frames, (f) => f.y) - 14)
    .attr("text-anchor", "middle")
    .attr("fill", navy)
    .attr("font-family", '"Times New Roman", Times, serif')
    .attr("font-size", labelSize)
    .attr("font-style", "italic")
    .attr("opacity", 0)
    .text((n) => n);

  // Parts of a set, ringed inside their frame with a dashed outline: the image
  // of an application in its arrival set, its classes in the departure set.
  // A group is ringed where its points stand at its stage `t`.
  const inGroup = (g, t) => {
    const dir = g.side === "arrival" ? 1 : -1;
    const held = items.filter((d) => d.dir === dir && g.members.includes(d.label));
    const frame = frames[dir < 0 ? 0 : 1];
    const [low, high] = d3.extent(held, (d) => d.ys[t]);
    return {
      ...g,
      x: frame.x + 11,
      w: frame.w - 22,
      y: low - 25,
      h: high - low + 50,
    };
  };

  // Every group of every stage, with the stage it belongs to and its rank in
  // it.
  const groupGroups = svg.append("g")
    .selectAll("g")
    .data(stages.flatMap((stage, t) => (stage.groups ?? [])
      .map((g, i) => ({ ...inGroup(g, t), stage: t, rank: i }))))
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

  // The shapes of a bundle of arrows, by the key "from→to": `y` reads a
  // point's height in one arrangement or the other; the spread at an arrival
  // point depends on the arrows of the bundle that land there.
  const spread = 11;
  const arrowSize = 16;
  const keyOf = ([from, to]) => `${from}→${to}`;
  const shapes = (bundle, y) => {
    const arrivals = d3.group(bundle, ([, to]) => to);
    const rank = new Map();
    for (const [, together] of arrivals) {
      together.sort((l, m) =>
        y(byLabel.get(`A:${l[0]}`)) - y(byLabel.get(`A:${m[0]}`)));
      together.forEach((l, i) => rank.set(l, i - (together.length - 1) / 2));
    }
    return new Map(bundle.map((link) => {
      const [from, to] = link;
      const a = byLabel.get(`A:${from}`), b = byLabel.get(`B:${to}`);
      const p = { x: a.x + dotRadius + 10, y: y(a) };
      const q = { x: b.x - dotRadius - 10, y: y(b) + rank.get(link) * spread };
      const angle = Math.atan2(q.y - p.y, q.x - p.x);
      const wing = (s) => [
        q.x - arrowSize * Math.cos(angle + s * 0.4),
        q.y - arrowSize * Math.sin(angle + s * 0.4),
      ];
      return [keyOf(link), {
        line: `M${p.x},${p.y}L${q.x},${q.y}`,
        head: `M${q.x},${q.y}L${wing(1)}L${wing(-1)}Z`,
        length: Math.hypot(q.x - p.x, q.y - p.y),
        order: p.y,
      }];
    }));
  };

  // Every arrow of every stage, once; `at[t]` is its shape at stage t, if it
  // is there, and `then` its shape in the second arrangement.
  const atStage = stages.map((stage, t) =>
    shapes(stage.links ?? [], (d) => d.ys[t]));
  const after = shapes(stages[0].links ?? [], (d) => d.y1);
  const edges = [...new Map(stages.flatMap((stage) => stage.links ?? [])
    .map((link) => [keyOf(link), link])).keys()]
    .map((key) => ({ key, at: atStage.map((m) => m.get(key)),
                     then: after.get(key) }));
  // A dash as long as the arrow in any of its shapes hides it whole.
  for (const e of edges) {
    e.home = e.at.find((a) => a);
    e.dash = d3.max([...e.at, e.then].filter((a) => a), (a) => a.length);
  }

  const arrowGroups = svg.append("g")
    .selectAll("g")
    .data(edges)
    .join("g");

  const arrowLines = arrowGroups.append("path")
    .attr("d", (e) => e.home.line)
    .attr("fill", "none")
    .attr("stroke", navy)
    .attr("stroke-width", 2.5)
    .attr("stroke-dasharray", (e) => `${e.dash} ${e.dash}`)
    .attr("stroke-dashoffset", (e) => e.dash);

  const arrowHeads = arrowGroups.append("path")
    .attr("d", (e) => e.home.head)
    .attr("fill", navy)
    .attr("opacity", 0);

  // One caption per stage, and the one that takes its place in the second
  // arrangement, all in the same place.
  const captionOf = (text) => {
    const t = svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - margin - captionHeight + lineHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", navy)
      .style("font-family", mainFont)
      .attr("font-size", captionSize)
      .attr("font-style", "italic")
      .attr("opacity", 0);
    t.selectAll("tspan")
      .data(wrap(text))
      .join("tspan")
      .attr("x", width / 2)
      .attr("dy", (line, i) => (i ? lineHeight : 0))
      .text((line) => line);
    return t;
  };
  const captions = stages.map((stage) => captionOf(stage.caption ?? ""));
  const captionThen = captionOf(then?.caption ?? "");

  // Each part has its own named transition, so a later one does not cut an
  // earlier one short.
  const drawn = 400 + atStage[0].size * 180;
  const stageAt = (l) => Math.min(l, stages.length) - 1;
  let level = 0;
  const update = (next) => {
    if (next === level) return;
    const forward = next > level;
    // Coming onto the diagram, everything is drawn in turn; from one stage to
    // the next, only the arrows change.
    const fresh = forward && level === 0;
    const before = stageAt(level);
    level = next;
    const shown = level >= 1;
    const stage = stageAt(level);
    const moved = level >= 2 && then !== null;
    // Points that change places slide first; what the stage adds waits for
    // them.
    const shifting = !fresh && before >= 0 && stage >= 0
      && items.some((d) => d.ys[stage] !== d.ys[before]);
    const pause = forward && shifting ? 1200 : 0;

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

    // Arrows: those that come are drawn one after the other, from the top,
    // those that go are withdrawn, those that stay are left alone — but for
    // their shape, which may change with the arrows around them.
    const present = (e, t) => t >= 0 && e.at[t] !== undefined;
    const shape = (e) => (moved ? e.then : e.at[stage]);
    const coming = edges.filter((e) => present(e, stage) && !present(e, before))
      .sort((e, f) => e.at[stage].order - f.at[stage].order);
    coming.forEach((e, i) =>
      (e.wait = (fresh ? 900 : 200 + pause) + i * (forward ? 180 : 60)));
    const come = (e) => coming.includes(e);
    const go = (e) => present(e, before) && !present(e, stage);

    arrowLines.filter(come).interrupt("slide")
      .attr("d", (e) => shape(e).line);
    arrowHeads.filter(come).interrupt("slide")
      .attr("d", (e) => shape(e).head);
    arrowLines.filter(come).transition("arrows")
      .delay((e) => e.wait)
      .duration(forward ? 600 : 300)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", 0);
    arrowHeads.filter(come).transition("arrows")
      .delay((e) => e.wait + (forward ? 400 : 200))
      .duration(300)
      .attr("opacity", 1);
    arrowLines.filter(go).transition("arrows")
      .duration(300)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", (e) => e.dash);
    arrowHeads.filter(go).transition("arrows")
      .duration(150)
      .attr("opacity", 0);

    // The arrows that stay take their new shape: when the points slide, to a
    // stage that orders them otherwise or to the second arrangement, the
    // arrows follow.
    const stay = (e) => present(e, stage) && present(e, before);
    const slide = (selection) => selection.transition("slide")
      .duration(forward ? (moved || shifting ? 1200 : 600) : 500)
      .ease(d3.easeCubicInOut);
    const place = (d) => (moved ? d.y1 : d.ys[Math.max(stage, 0)]);
    slide(nodes)
      .attr("transform", (d) => `translate(${d.x},${place(d)})`);
    slide(arrowLines.filter(stay)).attr("d", (e) => shape(e).line);
    slide(arrowHeads.filter(stay)).attr("d", (e) => shape(e).head);

    const ringed = stage >= 0 ? (stages[stage].groups ?? []).length : 0;
    groupGroups.transition("groups")
      .delay((g) => (g.stage !== stage || !forward ? 0
                     : (fresh ? 900 + drawn : 300 + pause) + g.rank * 250))
      .duration(500)
      .attr("opacity", (g) => (g.stage === stage ? 1 : 0));

    const named = stage >= 0 ? stages[stage].name : null;
    const wasNamed = before >= 0 ? stages[before].name : null;
    names.transition("name")
      .delay((n) => (n !== named || n === wasNamed ? 0 : fresh ? 900 : 300))
      .duration(400)
      .attr("opacity", (n) => (n === named ? 1 : 0));

    captions.forEach((c, t) => c.transition("caption")
      .delay(t !== stage || moved ? 0
             : (fresh ? 900 + drawn : 300 + pause) + ringed * 250)
      .duration(400)
      .attr("opacity", t === stage && !moved ? 1 : 0));
    captionThen.transition("caption")
      .delay(moved && forward ? 1200 : 0)
      .duration(400)
      .attr("opacity", moved ? 1 : 0);
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
