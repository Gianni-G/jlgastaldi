# frozen_string_literal: true

source "https://rubygems.org"

gemspec

# Jekyll 4.3.1's Stevenson logger doesn't init logger>=1.6's @level_override,
# causing `undefined method '[]' for nil` on serve. Pin to a compatible version.
gem "logger", "~> 1.5.3"

# If you have any plugins, put them here!
group :jekyll_plugins do
    gem "jekyll-remote-theme"
    # BibTeX bibliographies and {% cite %} tags for the course pages.
    gem "jekyll-scholar"
    # jekyll-scholar 7.3 applies BibTeX filters (:smallcaps, :superscript, ...)
    # that only exist in bibtex-ruby >= 6.1; 6.0 raises on every field.
    gem "bibtex-ruby", ">= 6.1"
  end
  
