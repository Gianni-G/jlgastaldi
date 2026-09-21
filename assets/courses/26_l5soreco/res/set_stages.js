// Set diagram that changes shape, for reveal.js slides, drawn with D3.
//
// setStages(container, stages, steps, options) draws the scene of `stages[0]`
// at once, then moves from one stage to the next, one stage per reveal.js
// fragment in `steps`. Each stage describes a whole scene:
//
//   sets    [{key, cx, cy, r, label, color, italic}]
//                                   circles, biggest first; each label sits
//                                   inside its circle, near the top, in serif,
//                                   italic if `italic`;
//   items   [{key, label, x, y}]    points; the label is written to the right
//                                   of the point, wrapped at `maxChars`;
//           [{key, image, x, y, width, height}]
//                                   points labelled by an image instead,
//                                   centred on the point's height;
//   links   [{from, to, color, curve, dashed}]
//                                   arrows, by key, between two items or two
//                                   circles (the key of a set, or of a group,
//                                   does as well); an arrow leaves past the
//                                   label of an item, or the outline of a
//                                   circle, and lands the same way; arrows
//                                   sharing a target point are spread over its
//                                   side; an arrow keeps the colour of its
//                                   first stage throughout; `curve` bends it by
//                                   that many pixels at its middle, to the left
//                                   of the way it goes; `dashed` draws it
//                                   broken, and it then fades in rather than
//                                   being traced;
//   labels  [{key, text, x, y, size, anchor, italic, color}]
//                                   free text on the scene, in serif, italic
//                                   unless said otherwise — the name of a
//                                   bundle of arrows over them, a legend in a
//                                   corner; keyed like the rest, so a stage can
//                                   swap one for another, or drop it;
//   groups  [{key, cx, cy, r, label, color, dashed}]
//                                   circles drawn under the points, around a
//                                   part of a set, each labelled above itself
//                                   (a group only some stages hold comes and
//                                   goes with them); `dashed` draws a broken
//                                   outline, which fades in rather than being
//                                   traced;
//   transform  {k, dx, dy}          x' = k·x + dx, y' = k·y + dy, applied to
//                                   every coordinate of the stage — so one and
//                                   the same cloud can be written once and
//                                   shown at two scales. A set, an item or a
//                                   group may carry its own `transform`, `{}`
//                                   for none, and is then written where it
//                                   really goes.
//
// In a label, "^" raises what follows and "_" lowers it — one character, or a
// whole run between braces, as in "Σ^*", "S_V" and "F^I: L → M".
//
// Sets, items, arrows and groups are matched from one stage to the next by
// `key`: what stays moves, what appears is drawn, what goes fades out. Going
// back through the fragments undoes each step, faster.
//
//   <div id="scene"></div>
//   <div class="fragment" id="scene-1"></div>
//   <script>setStages("#scene",
//                     [{sets: [{key: "A", cx: 300, cy: 300, r: 250, label: "A"}],
//                       items: [{key: "a", label: "a", x: 200, y: 300}]},
//                      {sets: [{key: "A", cx: 300, cy: 300, r: 150, label: "A"}],
//                       items: [{key: "a", label: "a", x: 250, y: 300}]}],
//                     ["#scene-1"]);</script>

function setStages(container, stages, steps, options = {}) {
  const {
    width = 1150,
    height = 640,
    maxHeight = 620,        // so that the diagram never overflows the slide
    fontSize = 16,
    maxChars = 30,          // wrap labels longer than this, at spaces
    labelOffset = 34,       // from the top of a circle to its label
    labelSize = 32,
    groupLabelSize = 26,    // a group's label, written above its circle
    textSize = 34,          // a label's size, unless it sets its own
    navy = "#1d2769",
    yellow = "#fab600",
    blue = "#1f4e9e",       // the parts ringed by a stage's `groups`
  } = options;

  const dotRadius = 5;
  const dotGap = 8;
  const charWidth = 0.6 * fontSize;   // Courier New advance width
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

  // Superscripts and subscripts, from "Σ^*", "S_V" and "F^I: L → M": "^" and
  // "_" take the one character that follows, or a whole run between braces.
  const parts = (label) => {
    const out = [];
    let plain = "", i = 0;
    while (i < label.length) {
      if (label[i] !== "^" && label[i] !== "_") { plain += label[i++]; continue; }
      if (plain) { out.push({ text: plain, shift: 0 }); plain = ""; }
      const shift = label[i++] === "^" ? -0.4 : 0.25;
      if (label[i] === "{") {
        const end = label.indexOf("}", i);
        out.push({ text: label.slice(i + 1, end), shift });
        i = end + 1;
      } else {
        out.push({ text: label[i] ?? "", shift });
        i += 1;
      }
    }
    if (plain) out.push({ text: plain, shift: 0 });
    return out;
  };

  // Written out as tspans: each one moves the baseline by the difference, so
  // that ordinary text after a superscript comes back down.
  const spans = (label, size) => {
    let base = 0;
    return parts(label).map((part) => {
      const dy = (part.shift - base) * size;
      base = part.shift;
      return { text: part.text, dy: dy || null, size: part.shift ? 0.7 * size : null };
    });
  };

  // Every coordinate of a stage goes through the stage's own transform, so
  // that one cloud of items can be written once and placed twice. An element
  // may carry a transform of its own, `{}` for none, and is then written where
  // it really goes.
  const placed = (stage) => {
    const own = (d) => {
      const { k = 1, dx = 0, dy = 0 } = d.transform ?? stage.transform ?? {};
      return { k, dx, dy };
    };
    const at = (d) => {
      const { k, dx, dy } = own(d);
      return { ...d, x: k * d.x + dx, y: k * d.y + dy };
    };
    const round = (d) => {
      const { k, dx, dy } = own(d);
      return { ...d, cx: k * d.cx + dx, cy: k * d.cy + dy, r: k * d.r };
    };
    return {
      sets: (stage.sets ?? []).map(round),
      items: (stage.items ?? []).map(at),
      groups: (stage.groups ?? []).map(round),
      links: stage.links ?? [],
      // A label is keyed like the rest, on its own text by default, so that
      // one stage can swap it for another.
      labels: (stage.labels ?? []).map((d) => at({ key: d.text, ...d })),
    };
  };

  const byKey = (list) => new Map(list.map((d) => [d.key, d]));
  // One element per key over all the stages; the stages that hold it say where
  // it is and whether it shows.
  const union = (maps) => {
    const all = new Map();
    for (const m of maps) for (const [key, d] of m) if (!all.has(key)) all.set(key, d);
    return [...all.values()];
  };

  const scenes = stages.map(placed);
  const sceneSets = scenes.map((s) => byKey(s.sets));
  const sceneItems = scenes.map((s) => byKey(s.items));
  const sceneGroups = scenes.map((s) => byKey(s.groups));
  const sceneLabels = scenes.map((s) => byKey(s.labels));

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .style("max-height", `${maxHeight}px`)
    .style("font-family", '"Courier New", Courier, monospace')
    .style("font-size", `${fontSize}px`);

  // Sets and groups are the same drawing in two layers — the sets underneath,
  // then the groups, then the points, then the arrows on top. A circle is
  // traced with a dash as long as its outline, and wiped the same way when it
  // goes; a circle that merely moves keeps its outline whole. A `dashed` one
  // cannot be traced, its dashes being the drawing itself, so it fades in and
  // out instead.
  const circumference = (d) => 2 * Math.PI * d.r;
  const dashes = (d) => (d.dashed ? "9 7" : `${circumference(d)} ${circumference(d)}`);

  const circleLayer = (data, defaultColor, inside) => {
    const size = inside ? labelSize : groupLabelSize;
    const color = (d) => d.color ?? defaultColor;
    const labelY = (d) => (inside ? d.cy - d.r + labelOffset : d.cy - d.r - 12);

    const groups = svg.append("g")
      .selectAll("g")
      .data(data, (d) => d.key)
      .join("g");

    const fills = groups.append("circle")
      .attr("cx", (d) => d.cx).attr("cy", (d) => d.cy).attr("r", (d) => d.r)
      .attr("fill", color)
      .attr("fill-opacity", 0);

    const outlines = groups.append("circle")
      .attr("cx", (d) => d.cx).attr("cy", (d) => d.cy).attr("r", (d) => d.r)
      .attr("transform", (d) => `rotate(-90 ${d.cx} ${d.cy})`)   // start at the top
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", dashes)
      .attr("stroke-dashoffset", (d) => (d.dashed ? 0 : circumference(d)))
      .attr("stroke-opacity", (d) => (d.dashed ? 0 : 1));

    const labels = groups.filter((d) => d.label).append("text")
      .attr("x", (d) => d.cx)
      .attr("y", labelY)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", color)
      .attr("font-family", '"Times New Roman", Times, serif')
      .attr("font-size", size)
      .attr("font-style", (d) => (d.italic || !inside ? "italic" : "normal"))
      .attr("opacity", 0);
    labels.selectAll("tspan")
      .data((d) => spans(d.label, size))
      .join("tspan")
      .attr("dy", (p) => p.dy)
      .attr("font-size", (p) => p.size)
      .text((p) => p.text);

    return { fills, outlines, labels, labelY };
  };

  const sets = circleLayer(union(sceneSets), yellow, true);
  const rings = circleLayer(union(sceneGroups), blue, false);

  const nodes = svg.append("g")
    .selectAll("g")
    .data(union(sceneItems), (d) => d.key)
    .join("g")
    .attr("transform", (d) => `translate(${d.x},${d.y})`)
    .attr("opacity", 0);

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

  // Arrows: straight, from past the label of the departure point — the labels
  // sit on the right of their point here — to the left of the arrival point.
  // Arrows landing on the same point are spread over its left side so that
  // their heads stay apart.
  const arrowSize = 16;
  const spread = 11;
  const labelWidth = (d) =>
    (d.image ? d.width : d3.max(wrap(d), (line) => line.length) * charWidth);

  const edges = (stage, at) => {
    const items = sceneItems[at];
    // A group's outline does as well as a set's for the end of an arrow; a set
    // wins if ever the two share a key.
    const circles = new Map([...sceneGroups[at], ...sceneSets[at]]);
    const height = (key) => items.get(key)?.y ?? circles.get(key).cy;

    // Only arrows landing on a point need spreading; on a circle they all
    // reach for the same side anyway.
    const rank = new Map();
    for (const [key, together] of d3.group(stage.links, (l) => l.to)) {
      if (!items.has(key)) continue;
      together.sort((l, m) => height(l.from) - height(m.from));
      together.forEach((l, i) => rank.set(l, i - (together.length - 1) / 2));
    }

    return stage.links.map((link) => {
      const a = items.get(link.from), b = items.get(link.to);
      const ca = a ? null : circles.get(link.from), cb = b ? null : circles.get(link.to);
      // An arrow leaves past the label of a point, or the outline of a circle,
      // reaching from one centre towards the other.
      const from = a
        ? { x: a.x + dotRadius + dotGap + labelWidth(a) + 10, y: a.y }
        : { x: ca.cx, y: ca.cy };
      const towards = b
        ? { x: b.x - dotRadius - 10, y: b.y + (rank.get(link) ?? 0) * spread }
        : { x: cb.cx, y: cb.cy };
      const aim = Math.atan2(towards.y - from.y, towards.x - from.x);
      const p = ca
        ? { x: ca.cx + (ca.r + 10) * Math.cos(aim), y: ca.cy + (ca.r + 10) * Math.sin(aim) }
        : from;
      const q = cb
        ? { x: cb.cx - (cb.r + 10) * Math.cos(aim), y: cb.cy - (cb.r + 10) * Math.sin(aim) }
        : towards;
      // A bent arrow is a quadratic curve whose control point sits `curve`
      // pixels off the middle of the chord, to the left of the way the arrow
      // goes; its head follows the tangent there rather than the chord.
      const chord = Math.atan2(q.y - p.y, q.x - p.x);
      const bend = link.curve ?? 0;
      const c = {
        x: (p.x + q.x) / 2 + bend * Math.sin(chord),
        y: (p.y + q.y) / 2 - bend * Math.cos(chord),
      };
      const angle = bend ? Math.atan2(q.y - c.y, q.x - c.x) : chord;
      const wing = (s) => [
        q.x - arrowSize * Math.cos(angle + s * 0.4),
        q.y - arrowSize * Math.sin(angle + s * 0.4),
      ];
      return {
        key: `${link.from}→${link.to}`,
        color: link.color,
        dashed: link.dashed,
        line: bend
          ? `M${p.x},${p.y}Q${c.x},${c.y} ${q.x},${q.y}`
          : `M${p.x},${p.y}L${q.x},${q.y}`,
        head: `M${q.x},${q.y}L${wing(1)}L${wing(-1)}Z`,
        order: p.y,
      };
    });
  };

  const sceneArrows = scenes.map(edges).map(byKey);
  const allArrows = union(sceneArrows);
  allArrows.sort((e, f) => e.order - f.order).forEach((e, i) => (e.delay = i * 180));

  const arrowGroups = svg.append("g")
    .selectAll("g")
    .data(allArrows, (e) => e.key)
    .join("g");

  // `pathLength` keeps one dash as long as the line, however long it is. A
  // `dashed` arrow cannot be traced, its dashes being the drawing itself, so it
  // fades in and out instead — as a dashed circle does.
  const arrowLines = arrowGroups.append("path")
    .attr("d", (e) => e.line)
    .attr("fill", "none")
    .attr("stroke", (e) => e.color ?? navy)
    .attr("stroke-width", 2.5)
    .attr("pathLength", (e) => (e.dashed ? null : 1))
    .attr("stroke-dasharray", (e) => (e.dashed ? "9 7" : "1 1"))
    .attr("stroke-dashoffset", (e) => (e.dashed ? 0 : 1))
    .attr("stroke-opacity", (e) => (e.dashed ? 0 : 1));

  const arrowHeads = arrowGroups.append("path")
    .attr("d", (e) => e.head)
    .attr("fill", (e) => e.color ?? navy)
    .attr("opacity", 0);

  const sized = (d) => d.size ?? textSize;
  const texts = svg.append("g")
    .selectAll("text")
    .data(union(sceneLabels), (d) => d.key)
    .join("text")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y)
    .attr("text-anchor", (d) => d.anchor ?? "middle")
    .attr("dy", "0.35em")
    .attr("fill", (d) => d.color ?? navy)
    .attr("font-family", '"Times New Roman", Times, serif')
    .attr("font-size", sized)
    .attr("font-style", (d) => (d.italic === false ? "normal" : "italic"))
    .attr("opacity", 0);
  texts.selectAll("tspan")
    .data((d) => spans(d.text, sized(d)))
    .join("tspan")
    .attr("dy", (p) => p.dy)
    .attr("font-size", (p) => p.size)
    .text((p) => p.text);

  // Show a stage: `instant` puts everything in place at once, as the slide
  // opens; going back is the same in reverse, and quicker.
  const show = (at, { instant = false, forward = true } = {}) => {
    const shownSet = sceneSets[at], shownItem = sceneItems[at];
    const shownGroup = sceneGroups[at], shownArrow = sceneArrows[at];
    const dur = (ms) => (instant ? 0 : forward ? ms : Math.round(0.45 * ms));
    const del = (ms) => (instant || !forward ? 0 : ms);
    const here = (map) => (d) => map.has(d.key);
    const to = (map) => (d) => map.get(d.key) ?? d;

    // Each part has its own named transition, so that a later one does not cut
    // an earlier one short.
    const moveCircles = (layer, map, delay) => {
      const target = to(map);
      const staying = (selection) => selection.filter(here(map))
        .transition("move")
        .delay(del(delay))
        .duration(dur(700))
        .ease(d3.easeCubicInOut);

      staying(layer.fills)
        .attr("cx", (d) => target(d).cx)
        .attr("cy", (d) => target(d).cy)
        .attr("r", (d) => target(d).r);
      staying(layer.outlines)
        .attr("cx", (d) => target(d).cx)
        .attr("cy", (d) => target(d).cy)
        .attr("r", (d) => target(d).r)
        .attr("transform", (d) => `rotate(-90 ${target(d).cx} ${target(d).cy})`)
        .attr("stroke-dasharray", (d) => dashes(target(d)));
      staying(layer.labels)
        .attr("x", (d) => target(d).cx)
        .attr("y", (d) => layer.labelY(target(d)));

      layer.outlines.transition("draw")
        .delay((d) => del(here(map)(d) ? delay : 0))
        .duration((d) => dur(here(map)(d) ? 900 : 400))
        .ease(d3.easeCubicInOut)
        .attr("stroke-dashoffset", (d) =>
          (d.dashed || here(map)(d) ? 0 : circumference(target(d))))
        .attr("stroke-opacity", (d) => (d.dashed && !here(map)(d) ? 0 : 1));
      layer.fills.transition("fill")
        .delay((d) => del(here(map)(d) ? delay + 400 : 0))
        .duration(dur(500))
        .attr("fill-opacity", (d) => (here(map)(d) ? 0.12 : 0));
      layer.labels.transition("label")
        .delay((d) => del(here(map)(d) ? delay + 500 : 0))
        .duration(dur(400))
        .attr("opacity", (d) => (here(map)(d) ? 1 : 0));
    };

    moveCircles(sets, shownSet, 0);

    nodes.filter(here(shownItem))
      .transition("move")
      .delay(del(200))
      .duration(dur(800))
      .ease(d3.easeCubicInOut)
      .attr("transform", (d) =>
        `translate(${to(shownItem)(d).x},${to(shownItem)(d).y})`);
    nodes.transition("appear")
      .delay((d) => del(here(shownItem)(d) ? 400 : 0))
      .duration(dur(400))
      .attr("opacity", (d) => (here(shownItem)(d) ? 1 : 0));

    // The rings come last: the points have to gather inside them first.
    moveCircles(rings, shownGroup, 900);

    // An arrow already on screen stays whole while its two ends move; a new
    // one is traced once the points are in place.
    const moving = (selection) => selection.filter(here(shownArrow))
      .transition("move")
      .delay(del(200))
      .duration(dur(800))
      .ease(d3.easeCubicInOut);
    moving(arrowLines).attr("d", (e) => to(shownArrow)(e).line);
    moving(arrowHeads).attr("d", (e) => to(shownArrow)(e).head);

    arrowLines.transition("draw")
      .delay((e) => del(here(shownArrow)(e) ? 1000 + e.delay : 0))
      .duration((e) => dur(here(shownArrow)(e) ? 600 : 300))
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", (e) =>
        (e.dashed || here(shownArrow)(e) ? 0 : 1))
      .attr("stroke-opacity", (e) =>
        (e.dashed && !here(shownArrow)(e) ? 0 : 1));
    arrowHeads.transition("draw")
      .delay((e) => del(here(shownArrow)(e) ? 1400 + e.delay : 0))
      .duration((e) => dur(here(shownArrow)(e) ? 300 : 150))
      .attr("opacity", (e) => (here(shownArrow)(e) ? 1 : 0));

    const shownText = sceneLabels[at];
    texts.transition("name")
      .delay((d) => del(here(shownText)(d) ? 1200 : 0))
      .duration(dur(400))
      .attr("opacity", (d) => (here(shownText)(d) ? 1 : 0));
  };

  // The first stage is simply there, undrawn, as the slide opens.
  show(0, { instant: true });

  let level = 0;
  const update = (next) => {
    if (next === level) return;
    const forward = next > level;
    level = next;
    show(Math.min(level, scenes.length - 1), { forward });
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
