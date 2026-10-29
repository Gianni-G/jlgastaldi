-- Beamer-style trimming of images in HTML output (reveal.js slides), after
-- graphicx's \includegraphics[trim=l b r t, clip]:
--
--   ![](media/plot.png){trim="0 50 60 50" height="400px"}
--
-- `trim` lists what to cut off the left, bottom, right and top edges, in bp
-- by default, as in the .tex files, or with a unit: bp, pt, mm, cm, in, or px
-- for pixels of the file. As pdfTeX does, lengths are converted to pixels at
-- the image's own resolution (72 dpi if it records none), so the numbers of a
-- beamer deck carry over unchanged.
--
-- The image is wrapped in a box the size of what is left, its overflow
-- hidden, the image shifted inside it. `width` and `height` size that box,
-- i.e. the visible part, as they size the clipped image in graphicx: with
-- one of them the other follows the aspect ratio, with neither the box keeps
-- the pixel size of what is left. The id, classes and style move to the box,
-- so that `.fragment`, `.absolute` and the like act on the trimmed image.
--
-- Other formats get the image back without the attribute. Raw HTML <img>
-- tags are left alone.

local bp_per = { bp = 1, pt = 72 / 72.27, mm = 72 / 25.4, cm = 72 / 2.54, ["in"] = 72 }

-- A trim length in pixels of the file, `dpi` being its resolution.
local function pixels(length, dpi)
  local number, unit = length:match("^(%-?[%d%.]+)(%a*)$")
  if not number then return nil end
  if unit == "px" then return tonumber(number) end
  local factor = bp_per[unit == "" and "bp" or unit]
  return factor and tonumber(number) * factor * dpi / 72
end

-- A CSS length: pandoc reads a bare number as pixels.
local function css(length)
  return length:match("^[%d%.]+$") and length .. "px" or length
end

local function skip(img, why)
  quarto.log.warning("trim: " .. why .. " (" .. img.src .. "), image left untrimmed")
  return img
end

function Image(img)
  local spec = img.attributes.trim
  if not spec then return nil end
  img.attributes.trim = nil
  if not quarto.doc.is_format("html") then return img end

  local _, contents = pandoc.mediabag.fetch(img.src)
  local read, size = pcall(pandoc.image.size, contents or "")
  if not contents or not read then return skip(img, "cannot read the image's size") end

  local lengths = {}
  for length in spec:gsub(",", " "):gmatch("%S+") do lengths[#lengths + 1] = length end
  if #lengths ~= 4 then return skip(img, "trim takes four lengths, left bottom right top") end
  local dpi_x, dpi_y = size.dpi_horz or 72, size.dpi_vert or 72
  local left, bottom = pixels(lengths[1], dpi_x), pixels(lengths[2], dpi_y)
  local right, top = pixels(lengths[3], dpi_x), pixels(lengths[4], dpi_y)
  if not (left and bottom and right and top) then return skip(img, "unknown unit in trim") end

  -- What is left of the image, in pixels of the file.
  local w, h = size.width - left - right, size.height - top - bottom
  if w <= 0 or h <= 0 then return skip(img, "trim leaves nothing") end

  -- The box takes the margin reveal.js gives images, so that trimmed and
  -- untrimmed images line up (elsewhere the variable is unset: no margin).
  local width, height = img.attributes.width, img.attributes.height
  local box = {
    "display: inline-block",
    "position: relative",
    "overflow: hidden",
    "margin: var(--r-block-margin) 0",
    string.format("aspect-ratio: %.3f / %.3f", w, h),
  }
  if width then box[#box + 1] = "width: " .. css(width) end
  if height then box[#box + 1] = "height: " .. css(height) end
  if not (width or height) then box[#box + 1] = string.format("width: %.3fpx", w) end
  if img.attributes.style then box[#box + 1] = img.attributes.style end

  -- The whole image, as wide as the box is wide relative to what is left,
  -- and shifted by what is cut off the left and the top; percentages of the
  -- box, so that it follows the box's size.
  img.attributes.width, img.attributes.height = nil, nil
  img.attributes.style = table.concat({
    "position: absolute",
    string.format("left: %.4f%%", -100 * left / w),
    string.format("top: %.4f%%", -100 * top / h),
    string.format("width: %.4f%%", 100 * size.width / w),
    "height: auto",
    "max-width: none",
    "max-height: none",
    "margin: 0",
  }, "; ")

  local attr = pandoc.Attr(img.identifier, img.classes, { style = table.concat(box, "; ") })
  img.identifier, img.classes = "", pandoc.List()
  return pandoc.Span({ img }, attr)
end
