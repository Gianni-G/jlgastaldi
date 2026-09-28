// Venn diagram of a few sets, for reveal.js slides, drawn with D3.
//
// vennDiagram(container, spec, steps, options) draws the circles of
// `spec.sets` and the labelled points of `spec.items`, and shades the part of
// the diagram named by `spec.shade`:
//
//   spec.universe  "E"                   if given, a frame around the whole
//                                        diagram — the set every other set
//                                        is a part of — named above it;
//   spec.sets      [{key, cx, cy, r, side, label}]
//                                        circles, named by `label`, or else
//                                        by `key`, in serif italic, above
//                                        them on the left, or on the right if
//                                        `side` is "right";
//   spec.items     [{label, x, y}]       points, labelled on their right;
//   spec.shade     [["A", "B"], ["A"]]   the cells to shade, in red: each
//                                        cell is given by the sets it lies
//                                        inside, and lies outside all the
//                                        others — [] is the part of the
//                                        universe outside every circle;
//   spec.caption   "..."                 one line under the diagram, wrapped
//                                        at `options.maxChars`;
//   spec.stages    [{shade, caption}]    in place of `shade` and `caption`:
//                                        one shading and caption per fragment
//                                        of `steps`, the diagram itself being
//                                        drawn once.
//
// Coordinates are those of the viewBox, `options.width` × `options.height`,
// the bottom of which is kept for the caption.
//
// Everything is drawn as soon as the first fragment of `steps` is visible,
// as arrowDiagram does: the frame and the circles are traced, the points
// appear, then the shaded cells and the caption fade in. With `spec.stages`,
// each further fragment only swaps the shaded cells and the caption for the
// next ones. Going back through the fragments undoes each step.
//
//   <div class="fragment" id="venn"></div>
//   <script>vennDiagram("#venn",
//                       {sets: [{key: "A", cx: 280, cy: 290, r: 180}],
//                        items: [{label: "a", x: 260, y: 290}],
//                        shade: [["A"]]},
//                       ["#venn"]);</script>

function vennDiagram(container, spec, steps, options = {}) {
  const {
    width = 560,
    height = 620,
    maxHeight = 600,        // so that the diagram never overflows the slide
    fontSize = 26,
    labelSize = 34,         // set names
    captionSize = 21,
    maxChars = 52,          // wrap the caption at spaces
    captionRows = 3,        // room kept for the caption, however long it is,
                            // so that overlaid diagrams keep the same frames
    margin = 14,
    navy = "#1d2769",
    yellow = "#fab600",
    red = "#d52b1e",        // the cells named by `spec.shade`
    // the slide's own font, for the caption
    mainFont = 'var(--r-main-font, "Helvetica Neue", Helvetica, Arial, sans-serif)',
  } = options;

  const {
    universe = null,
    sets = [],
    items = [],
    shade = [],
    caption = "",
  } = spec;
  const stages = spec.stages ?? [{ shade, caption }];

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

  // The universe fills the room left above the caption, as the two frames of
  // arrowDiagram do.
  const captionHeight = stages.some((t) => t.caption)
    ? captionRows * lineHeight : 0;
  const top = margin + labelSize + 12;
  const bottom = height - margin - (captionHeight ? captionHeight + 14 : 0);
  const frame = { x: margin + 6, y: top, w: width - 2 * margin - 12,
                  h: bottom - top };
  const corner = 30;
  const perimeter = 2 * (frame.w + frame.h) - 8 * corner + 2 * Math.PI * corner;

  // Ids of this diagram's clip paths and masks, unique on the page.
  const uid = `venn-${String(container).replace(/[^\w-]/g, "")}`;
  // Circles are numbered in there, since a key such as "{a}" is no id.
  const byKey = new Map(sets.map((s) => [s.key, s]));
  const clipId = (key) => `${uid}-clip-${sets.indexOf(byKey.get(key))}`;

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .style("max-height", `${maxHeight}px`)
    .style("font-family", '"Courier New", Courier, monospace')
    .style("font-size", `${fontSize}px`);

  // One clip path per circle, and one mask per shaded cell of each stage:
  // white inside every circle the cell lies in (the first one drawn, clipped
  // by the others), black inside every other circle.
  const defs = svg.append("defs");
  for (const s of sets) {
    defs.append("clipPath")
      .attr("id", clipId(s.key))
      .append("circle")
      .attr("cx", s.cx).attr("cy", s.cy).attr("r", s.r);
  }
  const cellId = (t, k) => `${uid}-cell-${t}-${k}`;
  stages.forEach((stage, t) => (stage.shade ?? []).forEach((inside, k) => {
    const mask = defs.append("mask")
      .attr("id", cellId(t, k))
      .attr("maskUnits", "userSpaceOnUse")
      .attr("x", 0).attr("y", 0)
      .attr("width", width).attr("height", height);
    if (inside.length === 0) {
      const room = universe ? frame : { x: 0, y: 0, w: width, h: height };
      mask.append("rect")
        .attr("x", room.x).attr("y", room.y)
        .attr("width", room.w).attr("height", room.h)
        .attr("rx", universe ? corner : 0)
        .attr("fill", "#fff");
    } else {
      let g = mask;
      for (const key of inside.slice(1)) {
        g = g.append("g").attr("clip-path", `url(#${clipId(key)})`);
      }
      const s = byKey.get(inside[0]);
      g.append("circle")
        .attr("cx", s.cx).attr("cy", s.cy).attr("r", s.r)
        .attr("fill", "#fff");
    }
    for (const s of sets.filter((s) => !inside.includes(s.key))) {
      mask.append("circle")
        .attr("cx", s.cx).attr("cy", s.cy).attr("r", s.r)
        .attr("fill", "#000");
    }
  }));

  // The universe, drawn with a dash as long as its outline.
  const universeGroup = svg.append("g")
    .attr("display", universe ? null : "none");

  const universeLine = universeGroup.append("rect")
    .attr("x", frame.x).attr("y", frame.y)
    .attr("width", frame.w).attr("height", frame.h)
    .attr("rx", corner)
    .attr("fill", "none")
    .attr("stroke", navy)
    .attr("stroke-opacity", 0.55)
    .attr("stroke-width", 2.5)
    .attr("stroke-dasharray", `${perimeter} ${perimeter}`)
    .attr("stroke-dashoffset", perimeter);

  const universeLabel = universeGroup.append("text")
    .attr("x", frame.x + frame.w / 2)
    .attr("y", frame.y - 14)
    .attr("text-anchor", "middle")
    .attr("fill", navy)
    .attr("font-family", '"Times New Roman", Times, serif')
    .attr("font-size", labelSize)
    .attr("font-style", "italic")
    .attr("opacity", 0)
    .text(universe ?? "");

  // Circles: filled in yellow, as the frames of arrowDiagram, under the
  // shaded cells; their outline over them.
  const circleFills = svg.append("g")
    .selectAll("circle")
    .data(sets)
    .join("circle")
    .attr("cx", (s) => s.cx).attr("cy", (s) => s.cy).attr("r", (s) => s.r)
    .attr("fill", yellow)
    .attr("fill-opacity", 0);

  // The shaded cells, one layer per stage.
  const cells = svg.append("g")
    .selectAll("g")
    .data(stages)
    .join("g")
    .attr("opacity", 0);
  cells.each(function (stage, t) {
    d3.select(this).selectAll("rect")
      .data((stage.shade ?? []).map((inside, k) => k))
      .join("rect")
      .attr("x", 0).attr("y", 0)
      .attr("width", width).attr("height", height)
      .attr("fill", red)
      .attr("fill-opacity", 0.22)
      .attr("mask", (k) => `url(#${cellId(t, k)})`);
  });

  const circumference = (s) => 2 * Math.PI * s.r;
  const circleLines = svg.append("g")
    .selectAll("circle")
    .data(sets)
    .join("circle")
    .attr("cx", (s) => s.cx).attr("cy", (s) => s.cy).attr("r", (s) => s.r)
    .attr("fill", "none")
    .attr("stroke", yellow)
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", (s) => `${circumference(s)} ${circumference(s)}`)
    .attr("stroke-dashoffset", circumference);

  // Names: at the circle's upper left, or upper right, just outside it.
  const diagonal = Math.SQRT1_2;
  const circleLabels = svg.append("g")
    .selectAll("text")
    .data(sets)
    .join("text")
    .attr("x", (s) => s.cx + (s.side === "right" ? 1 : -1) * (s.r * diagonal + 6))
    .attr("y", (s) => s.cy - s.r * diagonal - 6)
    .attr("text-anchor", (s) => (s.side === "right" ? "start" : "end"))
    .attr("fill", navy)
    .attr("font-family", '"Times New Roman", Times, serif')
    .attr("font-size", labelSize)
    .attr("font-style", "italic")
    .attr("opacity", 0)
    .text((s) => s.label ?? s.key);

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
    .attr("x", dotRadius + dotGap)
    .attr("dy", "0.35em")
    .attr("fill", navy)
    .text((d) => d.label);

  // The captions, one per stage, in the same place.
  const captions = svg.append("g")
    .selectAll("text")
    .data(stages)
    .join("text")
    .attr("x", width / 2)
    .attr("y", height - margin - captionHeight + lineHeight / 2)
    .attr("text-anchor", "middle")
    .attr("fill", navy)
    .style("font-family", mainFont)
    .attr("font-size", captionSize)
    .attr("font-style", "italic")
    .attr("opacity", 0);
  captions.selectAll("tspan")
    .data((stage) => wrap(stage.caption ?? ""))
    .join("tspan")
    .attr("x", width / 2)
    .attr("dy", (line, i) => (i ? lineHeight : 0))
    .text((line) => line);

  // Each part has its own named transition, so a later one does not cut an
  // earlier one short.
  const drawn = 1200 + items.length * 45;
  let level = 0;
  const update = (next) => {
    if (next === level) return;
    const forward = next > level;
    // Coming onto the diagram, the stage waits for it to be drawn; from one
    // stage to the next, it follows at once.
    const fresh = forward && level === 0;
    level = next;
    const shown = level >= 1;
    const stage = Math.min(level, stages.length) - 1;

    universeLine.transition("draw")
      .duration(forward ? 1000 : 400)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", shown ? 0 : perimeter);
    universeLabel.transition("label")
      .delay(shown && forward ? 700 : 0)
      .duration(400)
      .attr("opacity", shown ? 1 : 0);

    circleLines.transition("draw")
      .delay((s, i) => (shown && forward ? 200 + i * 250 : 0))
      .duration(forward ? 1000 : 400)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", (s) => (shown ? 0 : circumference(s)));
    circleFills.transition("fill")
      .delay((s, i) => (shown && forward ? 700 + i * 250 : 0))
      .duration(600)
      .attr("fill-opacity", shown ? 0.12 : 0);
    circleLabels.transition("label")
      .delay((s, i) => (shown && forward ? 900 + i * 250 : 0))
      .duration(400)
      .attr("opacity", shown ? 1 : 0);

    nodes.transition("appear")
      .delay((d, i) => (shown && forward ? 1000 + i * 45 : 0))
      .duration(400)
      .attr("opacity", shown ? 1 : 0);

    cells.transition("cells")
      .delay(fresh ? drawn : 0)
      .duration(500)
      .attr("opacity", (d, t) => (t === stage ? 1 : 0));

    captions.transition("caption")
      .delay((d, t) => (t !== stage ? 0 : fresh ? drawn + 400 : 300))
      .duration(400)
      .attr("opacity", (d, t) => (t === stage ? 1 : 0));
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
