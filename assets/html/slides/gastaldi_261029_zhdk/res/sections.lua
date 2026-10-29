-- Section slides after beamer's \tableofcontents[currentsection,
-- hideallsubsections] (res/beamer_style.tex): each `# N. Section` slide
-- lists all the sections, as the contents slide does, the others shaded:
--
--   <div class="sections"><ul>
--     <li><span class="shaded">1. …</span></li>
--     <li><span>2. …</span></li>          (the section of the slide)
--     …
--   </ul></div>
--
-- The list goes right after the heading, on the heading's slide. The heading
-- itself stays, for the contents slide and the slide's id, and is hidden by
-- the stylesheet (res/gianni.scss), which also lays the list out as the
-- contents slide's.

function Pandoc(doc)
  if not quarto.doc.is_format("revealjs") then return nil end

  local sections = doc.blocks:filter(function(block)
    return block.t == "Header" and block.level == 1
  end)

  local blocks = pandoc.List()
  for _, block in ipairs(doc.blocks) do
    blocks:insert(block)
    if block.t == "Header" and block.level == 1 then
      local items = sections:map(function(section)
        local attr = section.identifier == block.identifier and {} or { class = "shaded" }
        return { pandoc.Plain({ pandoc.Span(section.content, attr) }) }
      end)
      blocks:insert(pandoc.Div({ pandoc.BulletList(items) }, { class = "sections" }))
    end
  end
  doc.blocks = blocks
  return doc
end
