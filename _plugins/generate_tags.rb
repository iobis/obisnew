module Jekyll
  class TagPage < Page
    def initialize(site, base, dir, tag, slug)
      @site = site
      @base = base
      @dir = dir
      @name = 'index.html'

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'tag.html')
      self.data['tag'] = tag
      self.data['title'] = "Posts tagged with \"#{tag}\""
      self.data['permalink'] = "/tag/#{slug}/"
    end
  end

  class TagGenerator < Generator
    safe true

    def slugify(tag)
      tag.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
    end

    def generate(site)
      all_docs = site.posts.docs
      if site.collections.key?('usecases')
        all_docs += site.collections['usecases'].docs
      end

      tags = all_docs.flat_map { |doc| doc.data['tags'] || [] }.uniq

      tags.each do |tag|
        slug = slugify(tag)
        site.pages << TagPage.new(site, site.source, File.join('tag', slug), tag, slug)
      end
    end
  end
end