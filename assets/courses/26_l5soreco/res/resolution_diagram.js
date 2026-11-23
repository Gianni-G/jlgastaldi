// Resolution derivation for reveal.js slides, after the figures of chapter 4
// of Brachman and Levesque (2004): each clause is written where it stands,
// and each resolvent hangs from two lines that go up to the literals its two
// parent clauses were resolved upon.
//
// resolutionDiagram(container, spec, options) appends to `container` an SVG
// of `spec.width` × `spec.height`, in the units of a 1200 × 800 slide:
//
//   spec.italic   ["x", "y", "A"]  words set in italic serif, as letters are
//                                  in the maths of the slides: the variables,
//                                  and the answer predicate; a word made of
//                                  one of them and digits takes the digits as
//                                  a subscript (x1 → x₁);
//   spec.clauses  [{id, lits, x, y, ...}]
//     lits        ["¬Child", "Girl"] the literals, written between brackets;
//                 [] is the empty clause; within a literal, a "^" sets the
//                 character after it as a superscript;
//     x, y        the middle of the clause, and its baseline;
//     query       true for the negation of the query, in red;
//     last        true for the clause that ends the derivation, in red;
//     color       any other colour;
//     note        {text, side, dx, dy, anchor} a few words in italic, in the
//                 clause's colour: under the clause, or just after its end
//                 with `side: "right"`, just before its start with "left",
//                 then moved by `dx`, `dy`;
//     from        [[id, k], [id, k]] for a resolvent: its two parents, and in
//                 each the index of the literal it was resolved upon;
//     sub         "x/sue" or {text, on, at, side, gap, dx, dy, anchor}: the
//                 unifying substitution, written beside the line to the
//                 parent `from[on]` (the first by default), at `at` of its
//                 length from the resolvent (0.5), `gap` away from it (14) on
//                 its `side` ("right" or "left", looking from the resolvent
//                 to the parent), then moved by `dx`, `dy`;
//     step        the fragment index at which the clause appears — for a
//                 resolvent, with its two lines and its substitution, the two
//                 literals it was resolved upon being ringed in red for as
//                 long as that fragment is the current one;
//   spec.cut      [[x1, y1], [x2, y2], ...] the dashed line that sets the
//                 given clauses apart from the resolvents — two points, or
//                 more for a line that bends round them — shown from the
//                 fragment `spec.cutStep`, if any;
//   spec.texts    [{text, x, y, step, anchor, size, color, italic}] anything
//                 else, such as the "…" of a branch that does not end;
//   spec.label    the description read out in place of the picture.
//
// The fragments are elements of the SVG with the classes reveal.js reads, so
// they take their turn among the fragments of the slide: give the other
// fragments of the slide indices that come before or after.
//
//   <div id="derivation"></div>
//   <script>resolutionDiagram("#derivation", {width: 600, height: 260,
//     clauses: [{id: "p", lits: ["p"], x: 150, y: 60},
//               {id: "np", lits: ["¬p"], x: 450, y: 60, query: true},
//               {id: "e", lits: [], x: 300, y: 220, last: true, step: 1,
//                from: [["p", 0], ["np", 0]]}]});</script>
//
// Only function declarations at the top, so that the file may be loaded by
// several slides.

function resolutionDiagram(container, spec, options = {}) {
  const {
    fontSize = 24,
    smallSize = 0.78,       // substitutions and notes, as a share of fontSize
    // The clauses are formulas: they take the regular weight of the maths
    // of the slides (MathJax), not the light one of their text, which at this
    // size runs "n(" together into "r(".
    weight = 400,
    maxHeight = 560,        // so that the diagram never overflows the slide
    navy = "#1d2769",
    red = "#ff3333",        // `.alert`
    purple = "#5b2a86",     // substitutions, like the quantifiers that bind
                            // the variables (`.noeud.quantificateur`)
    grey = "#9aa0a6",       // the dashed line
    sans = '"Helvetica Neue", Helvetica, Arial, sans-serif',
    serif = '"Times New Roman", Times, serif',
    // the signs ¬, = and ≠, in a mathematical font, as MathJax sets them: the
    // ¬ of the sans font, or of Times, has a hook so short that it reads as a
    // minus
    signFont = '"STIX Two Math", STIXGeneral, "Cambria Math", "Times New Roman", serif',
  } = options;

  const host = typeof container === "string"
    ? document.querySelector(container) : container;
  const italic = new Set(spec.italic ?? []);
  const small = smallSize * fontSize;

  const meter = resolutionMeter();

  // A literal, or a substitution, cut into the pieces that make its tspans:
  // words, in italic if they are variables, the signs ¬, = and ≠, in a
  // mathematical font, as MathJax sets them, and runs of other characters. A
  // comma between arguments takes a thin space after it, as in the maths.
  const signs = new Set(["¬", "=", "≠"]);
  const piecesOf = (text) => {
    const out = [];
    let depth = 0;
    const re = /\^(.)|([\p{L}\p{N}_]+)|([^\p{L}\p{N}_^]+)/gu;
    for (const [, sup, word, other] of text.matchAll(re)) {
      if (sup !== undefined) {
        out.push({ text: sup, kind: "sup" });
      } else if (word !== undefined) {
        const indexed = word.match(/^(\p{L}+)(\p{N}+)$/u);
        if (italic.has(word)) {
          out.push({ text: word, kind: "italic" });
        } else if (indexed && italic.has(indexed[1])) {
          out.push({ text: indexed[1], kind: "italic" },
                   { text: indexed[2], kind: "sub" });
        } else {
          out.push({ text: word, kind: "sans" });
        }
      } else {
        let run = "";
        for (const ch of other) {
          if (signs.has(ch)) {
            if (run) out.push({ text: run, kind: "sans" });
            out.push({ text: ch, kind: "sign" });
            run = "";
            continue;
          }
          if (ch === "(") depth += 1;
          if (ch === ")") depth -= 1;
          run += ch === "," && depth > 0 ? ",\u2009" : ch;
        }
        if (run) out.push({ text: run, kind: "sans" });
      }
    }
    return out;
  };

  // A clause: its literals between brackets, each piece knowing the literal
  // it belongs to (-1 for the brackets and the commas between literals).
  const clausePieces = (lits) => {
    const out = [{ text: "[", kind: "sans", lit: -1 }];
    if (lits.length === 0) out.push({ text: "\u2002", kind: "sans", lit: -1 });
    lits.forEach((lit, k) => {
      if (k > 0) out.push({ text: ", ", kind: "sans", lit: -1 });
      for (const p of piecesOf(lit)) out.push({ ...p, lit: k });
    });
    out.push({ text: "]", kind: "sans", lit: -1 });
    return out;
  };

  // Italic correction, as in the maths: a little room after an italic
  // letter, and before one that follows a bracket or a parenthesis.
  const gapsOf = (pieces, size) => pieces.map((p, i) => {
    const before = pieces[i - 1];
    if (!before) return 0;
    if (before.kind === "italic" && p.kind !== "italic" && p.kind !== "sub") {
      return 0.08 * size;
    }
    if (p.kind === "italic" && before.kind !== "italic" && /[[(]$/.test(before.text)) {
      return 0.06 * size;
    }
    return 0;
  });

  // The tspans of a text. Sub- and superscripts are moved with `dy`, which
  // the next piece undoes; the italic correction is a `dx`.
  const fill = (text, pieces, size) => {
    let shift = 0;
    const gaps = gapsOf(pieces, size);
    return pieces.map((p, i) => {
      const target = p.kind === "sub" ? 0.28 * size
        : p.kind === "sup" ? -0.42 * size : 0;
      const t = svgElement("tspan", {}, text);
      t.setAttribute("font-family", p.kind === "italic" ? serif
                     : p.kind === "sign" ? signFont : sans);
      if (p.kind === "italic") t.setAttribute("font-style", "italic");
      if (p.kind === "sub" || p.kind === "sup") {
        t.setAttribute("font-size", 0.7 * size);
      }
      if (target !== shift) t.setAttribute("dy", target - shift);
      if (gaps[i]) t.setAttribute("dx", gaps[i]);
      shift = target;
      t.textContent = p.text;
      return t;
    });
  };

  const preserve = (text) => {
    text.setAttributeNS("http://www.w3.org/XML/1998/namespace",
                        "xml:space", "preserve");
    text.style.whiteSpace = "pre";
  };

  // The width of each piece, read off a copy in the measuring SVG.
  const measure = (pieces, size) => {
    const text = svgElement("text", { "font-size": size }, meter);
    preserve(text);
    text.style.fontWeight = weight;
    const widths = fill(text, pieces, size).map((t) => t.getComputedTextLength());
    meter.removeChild(text);
    return widths;
  };

  // Every clause, laid out: where it starts, how wide it is, and where each
  // of its literals starts and ends.
  const clauses = new Map();
  for (const c of spec.clauses) {
    const pieces = clausePieces(c.lits);
    const widths = measure(pieces, fontSize);
    const gaps = gapsOf(pieces, fontSize);
    const total = [...widths, ...gaps].reduce((a, b) => a + b, 0);
    const x0 = c.x - total / 2;
    const spans = c.lits.map(() => [Infinity, -Infinity]);
    let at = x0;
    pieces.forEach((p, i) => {
      at += gaps[i];
      if (p.lit >= 0) {
        spans[p.lit][0] = Math.min(spans[p.lit][0], at);
        spans[p.lit][1] = Math.max(spans[p.lit][1], at + widths[i]);
      }
      at += widths[i];
    });
    clauses.set(c.id, { ...c, pieces, x0, total, spans });
  }

  // A line goes from the top of a resolvent to the bottom of the literal of
  // its parent, or the other way round when the parent is lower.
  const above = 0.9 * fontSize;   // from the baseline to over the capitals
  const below = 0.4 * fontSize;   // from the baseline to under the descenders
  const middleOf = (c, k) =>
    (k === undefined || k < 0 ? c.x : (c.spans[k][0] + c.spans[k][1]) / 2);
  const ends = (child, parent, k) => {
    const up = parent.y < child.y;
    return [
      [child.x, up ? child.y - above : child.y + below],
      [middleOf(parent, k), up ? parent.y + below : parent.y - above],
    ];
  };

  const svg = svgElement("svg", {
    viewBox: `0 0 ${spec.width} ${spec.height}`,
    width: "100%",
    role: "img",
  }, host);
  svg.style.maxHeight = `${maxHeight}px`;
  svg.style.overflow = "visible";
  // `!important`, in the style attribute, to outweigh `.reveal .slides *`;
  // everything inside inherits it.
  svg.style.setProperty("font-weight", String(weight), "important");
  if (spec.label) svg.setAttribute("aria-label", spec.label);

  // Layers, from the bottom: the dashed line, the lines, the substitutions,
  // the clauses — so that no line is drawn over a clause — and the rings,
  // see-through, over the literals they ring.
  const [cutLayer, lineLayer, subLayer, clauseLayer, ringLayer] =
    [0, 1, 2, 3, 4].map(() => svgElement("g", {}, svg));

  // One group per step and per layer, with the classes reveal.js reads.
  const atStep = (layer, step, extra = "") => (step
    ? svgElement("g", { class: `fragment ${extra}`.trim(),
                        "data-fragment-index": step }, layer)
    : layer);

  // A white outline, under the letters, keeps a text legible over a line.
  const halo = (size) => ({
    stroke: "#fff",
    "stroke-width": 0.32 * size,
    "stroke-linejoin": "round",
    "paint-order": "stroke",
  });

  if (spec.cut) {
    svgElement("polyline", {
      points: spec.cut.map(([x, y]) => `${x},${y}`).join(" "),
      fill: "none", stroke: grey, "stroke-width": 2.5,
      "stroke-dasharray": "2 8", "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }, atStep(cutLayer, spec.cutStep));
  }

  for (const c of clauses.values()) {
    if (!c.from) continue;
    const lines = atStep(lineLayer, c.step);
    const rings = c.step ? atStep(ringLayer, c.step, "current-visible") : null;
    for (const [id, k] of c.from) {
      const parent = clauses.get(id);
      const [[x1, y1], [x2, y2]] = ends(c, parent, k);
      svgElement("line", {
        x1, y1, x2, y2,
        stroke: navy, "stroke-width": 2.2, "stroke-linecap": "round",
      }, lines);
      if (rings && k !== undefined && k >= 0) {
        const [s, e] = parent.spans[k];
        svgElement("rect", {
          x: s - 0.14 * fontSize, y: parent.y - 0.9 * fontSize,
          width: e - s + 0.28 * fontSize, height: 1.22 * fontSize,
          rx: 0.3 * fontSize,
          fill: red, "fill-opacity": 0.1, stroke: red, "stroke-width": 2,
        }, rings);
      }
    }
    if (c.sub) {
      const s = typeof c.sub === "string" ? { text: c.sub } : c.sub;
      const [id, k] = c.from[s.on ?? 0];
      const [[x1, y1], [x2, y2]] = ends(c, clauses.get(id), k);
      // Off the line, square to it: (px, py) is the unit vector to the side.
      const t = s.at ?? 0.5;
      const length = Math.hypot(x2 - x1, y2 - y1) || 1;
      const sign = (s.side ?? "right") === "right" ? 1 : -1;
      const px = -sign * (y2 - y1) / length;
      const py = sign * (x2 - x1) / length;
      const gap = s.gap ?? 14;
      const x = x1 + t * (x2 - x1) + gap * px + (s.dx ?? 0);
      const y = y1 + t * (y2 - y1) + gap * py + (s.dy ?? 0);
      const text = svgElement("text", {
        x,
        // a label below the line hangs from it, one above stands on it
        y: y + small * (0.35 + 0.45 * py),
        "font-size": small,
        fill: purple,
        "text-anchor": s.anchor ?? (px > 0.3 ? "start" : px < -0.3 ? "end" : "middle"),
        ...halo(small),
      }, atStep(subLayer, c.step));
      preserve(text);
      fill(text, piecesOf(s.text), small);
    }
  }

  for (const c of clauses.values()) {
    const color = c.color ?? (c.query || c.last ? red : navy);
    const group = atStep(clauseLayer, c.step);
    const text = svgElement("text", {
      x: c.x0, y: c.y, "font-size": fontSize, fill: color, ...halo(fontSize),
    }, group);
    preserve(text);
    fill(text, c.pieces, fontSize);
    if (c.note) {
      const n = typeof c.note === "string" ? { text: c.note } : c.note;
      const beside = n.side === "right" || n.side === "left";
      const x = n.side === "right" ? c.x0 + c.total + 0.4 * fontSize
        : n.side === "left" ? c.x0 - 0.4 * fontSize : c.x;
      const note = svgElement("text", {
        x: x + (n.dx ?? 0),
        y: c.y + (n.dy ?? (beside ? 0 : 1.05 * fontSize)),
        "font-size": small,
        "font-family": serif,
        "font-style": "italic",
        fill: color,
        "text-anchor": n.anchor
          ?? (n.side === "right" ? "start" : n.side === "left" ? "end" : "middle"),
        ...halo(small),
      }, group);
      note.textContent = n.text;
    }
  }

  for (const t of spec.texts ?? []) {
    const size = (t.size ?? 1) * fontSize;
    const text = svgElement("text", {
      x: t.x, y: t.y,
      "font-size": size,
      fill: t.color ?? navy,
      "text-anchor": t.anchor ?? "middle",
      ...halo(size),
    }, atStep(clauseLayer, t.step));
    preserve(text);
    if (t.italic) {
      text.setAttribute("font-family", serif);
      text.setAttribute("font-style", "italic");
      text.textContent = t.text;
    } else {
      fill(text, piecesOf(t.text), size);
    }
  }

  return svg;
}

// An SVG element, with its attributes, appended to `parent` if given.
function svgElement(name, attributes = {}, parent = null) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attributes)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

// The SVG the widths are measured in, outside the slides: reveal.js does not
// lay out the slides it is not showing, and a text that is not laid out has
// no width.
function resolutionMeter() {
  let meter = document.getElementById("resolution-meter");
  if (!meter) {
    meter = svgElement("svg", { id: "resolution-meter", width: 4000, height: 400 });
    meter.style.cssText =
      "position: absolute; left: -10000px; top: 0; visibility: hidden;";
    document.body.appendChild(meter);
  }
  return meter;
}
