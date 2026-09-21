// Nested set diagram for reveal.js slides, drawn with D3.
//
// nestedSets(container, sets, items, steps, options) draws the labelled
// points `items` from the start, then one circle of `sets` per reveal.js
// fragment in `steps`, from the first (biggest) to the last (smallest).
//
//   sets   [{cx, cy, r, label, color, italic}]
//                                circles, biggest first; each label sits
//                                inside its circle, near the top, in serif,
//                                italic if `italic`; "^" starts a superscript;
//   items  [{label, x, y}]       points; the label is written to the right
//                                of the point and wrapped at the item's
//                                `maxChars`, if any, else the option's;
//          [{image, x, y, width, height}]
//                                points labelled by an image instead,
//                                centred on the point's height.
//
// With `options.notes`, one more step shows notes in large type, each with
// a curved arrow from `from` to `to`, or else to the point of the circle
// `sets[target]` nearest to `from` (bowed by `bend`, negative for the other
// side):
//
//   notes  [{text, x, y, anchor, color, from: [x, y], to: [x, y] | target, bend}]
//
// Going back through the fragments undoes each step.
//
//   <div id="nested"></div>
//   <div class="fragment" id="nested-1"></div>
//   <div class="fragment" id="nested-2"></div>
//   <script>nestedSets("#nested",
//                      [{cx: 300, cy: 340, r: 280, label: "A"},
//                       {cx: 340, cy: 420, r: 150, label: "B"}],
//                      [{label: "a", x: 60, y: 340}, {label: "b", x: 300, y: 450}],
//                      ["#nested-1", "#nested-2"]);</script>

function nestedSets(container, sets, items, steps, options = {}) {
  const {
    width = 600,
    height = 680,
    fontSize = 16,
    maxChars = 30,          // wrap labels longer than this, at spaces
    labelOffset = 34,       // from the top of a circle to its label
    labelSize = 32,
    notes = [],             // shown at step sets.length + 1, see above
    noteSize = 38,
    navy = "#1d2769",
    yellow = "#fab600",
  } = options;

  const dotRadius = 5;
  const dotGap = 8;
  const lineHeight = 1.25 * fontSize;

  const wrap = (d) => d.label.split(" ").reduce((lines, word) => {
    const last = lines[lines.length - 1];
    if (last && (last + " " + word).length <= (d.maxChars ?? maxChars)) {
      lines[lines.length - 1] = last + " " + word;
    } else {
      lines.push(word);
    }
    return lines;
  }, []);

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .style("font-family", '"Courier New", Courier, monospace')
    .style("font-size", `${fontSize}px`);

  // Circles, drawn with a dash as long as their outline, under the points.
  const circles = svg.append("g")
    .selectAll("g")
    .data(sets)
    .join("g");

  const fills = circles.append("circle")
    .attr("cx", (s) => s.cx).attr("cy", (s) => s.cy).attr("r", (s) => s.r)
    .attr("fill", (s) => s.color ?? yellow)
    .attr("fill-opacity", 0);

  const outlines = circles.append("circle")
    .attr("cx", (s) => s.cx).attr("cy", (s) => s.cy).attr("r", (s) => s.r)
    .attr("transform", (s) => `rotate(-90 ${s.cx} ${s.cy})`)   // start at the top
    .attr("fill", "none")
    .attr("stroke", (s) => s.color ?? yellow)
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", (s) => `${2 * Math.PI * s.r} ${2 * Math.PI * s.r}`)
    .attr("stroke-dashoffset", (s) => 2 * Math.PI * s.r);

  const labels = circles.append("text")
    .attr("x", (s) => s.cx)
    .attr("y", (s) => s.cy - s.r + labelOffset)
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("fill", (s) => s.color ?? navy)
    .attr("font-family", '"Times New Roman", Times, serif')
    .attr("font-size", labelSize)
    .attr("font-style", (s) => (s.italic ? "italic" : "normal"))
    .attr("opacity", 0);
  labels.selectAll("tspan")
    .data((s) => s.label.split("^"))
    .join("tspan")
    .attr("dy", (part, i) => (i ? -0.4 * labelSize : null))
    .attr("font-size", (part, i) => (i ? 0.7 * labelSize : null))
    .text((part) => part);

  const nodes = svg.append("g")
    .selectAll("g")
    .data(items)
    .join("g")
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  nodes.append("circle")
    .attr("r", dotRadius)
    .attr("fill", navy);

  nodes.filter((d) => d.image).append("image")
    .attr("href", (d) => d.image)
    .attr("x", dotRadius + dotGap)
    .attr("y", (d) => -d.height / 2)
    .attr("width", (d) => d.width)
    .attr("height", (d) => d.height);

  nodes.filter((d) => !d.image).append("text")
    .attr("x", dotRadius + dotGap)
    .attr("dy", "0.35em")
    .attr("fill", navy)
    .selectAll("tspan")
    .data(wrap)
    .join("tspan")
    .attr("x", dotRadius + dotGap)
    .attr("dy", (line, i) => (i ? lineHeight : 0))
    .text((line) => line);

  // Notes, with their arrows drawn with a dash as long as the curve.
  const arrowSize = 14;
  for (const n of notes) {
    const [px, py] = n.from;
    if (n.target !== undefined) {
      const { cx, cy, r } = sets[n.target];
      const a = Math.atan2(py - cy, px - cx);
      n.to = [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    }
    const [qx, qy] = n.to;
    const k = n.bend ?? 0.3;
    n.c = [(px + qx) / 2 - (qy - py) * k, (py + qy) / 2 + (qx - px) * k];
    n.line = `M${px},${py}Q${n.c[0]},${n.c[1]} ${qx},${qy}`;
    const a = Math.atan2(qy - n.c[1], qx - n.c[0]);
    const corner = (s) => [qx - arrowSize * Math.cos(a + s * 0.45),
                           qy - arrowSize * Math.sin(a + s * 0.45)];
    n.head = `M${qx},${qy}L${corner(1)}L${corner(-1)}Z`;
  }
  const noteGroups = svg.append("g")
    .selectAll("g")
    .data(notes)
    .join("g");
  const noteTexts = noteGroups.append("text")
    .attr("x", (n) => n.x).attr("y", (n) => n.y)
    .attr("text-anchor", (n) => n.anchor ?? "start")
    .attr("dy", "0.35em")
    .attr("fill", (n) => n.color ?? navy)
    .attr("font-family", '"Times New Roman", Times, serif')
    .attr("font-size", noteSize)
    .attr("opacity", 0)
    .text((n) => n.text);
  const noteLines = noteGroups.append("path")
    .attr("d", (n) => n.line)
    .attr("fill", "none")
    .attr("stroke", (n) => n.color ?? navy)
    .attr("stroke-width", 2.5)
    .attr("pathLength", 1)
    .attr("stroke-dasharray", "1 1")
    .attr("stroke-dashoffset", 1);
  const noteHeads = noteGroups.append("path")
    .attr("d", (n) => n.head)
    .attr("fill", (n) => n.color ?? navy)
    .attr("opacity", 0);

  let level = 0;
  const update = (next) => {
    if (next === level) return;
    const forward = next > level;
    level = next;
    const shown = (s, i) => i < level;

    outlines.transition("draw")
      .duration(forward ? 1200 : 400)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", (s, i) => (shown(s, i) ? 0 : 2 * Math.PI * s.r));
    fills.transition("fill")
      .delay((s, i) => (shown(s, i) && forward ? 600 : 0))
      .duration(600)
      .attr("fill-opacity", (s, i) => (shown(s, i) ? 0.12 : 0));
    labels.transition("label")
      .delay((s, i) => (shown(s, i) && forward ? 900 : 0))
      .duration(400)
      .attr("opacity", (s, i) => (shown(s, i) ? 1 : 0));

    const noted = level > sets.length;
    noteTexts.transition("notes")
      .delay((n, i) => (noted ? i * 600 : 0))
      .duration(400)
      .attr("opacity", noted ? 1 : 0);
    noteLines.transition("notes")
      .delay((n, i) => (noted ? i * 600 + 300 : 0))
      .duration(noted ? 700 : 300)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", noted ? 0 : 1);
    noteHeads.transition("notes")
      .delay((n, i) => (noted ? i * 600 + 900 : 0))
      .duration(noted ? 300 : 150)
      .attr("opacity", noted ? 1 : 0);
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
