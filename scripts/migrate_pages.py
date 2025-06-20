import os
import shutil
import frontmatter
import subprocess
import re


source_dir = "../web"
target_dir = "../obisnew"


def update_source_folder():
    os.chdir(source_dir)
    subprocess.run(["git", "checkout", "patching"])
    subprocess.run(["git", "pull"])


def migrate_images(post):
    content = post.content
    image_paths = re.findall(r'src="([^"]*)"', content)
    
    target_images_dir = os.path.abspath(os.path.join(target_dir, "images"))
    os.makedirs(target_images_dir, exist_ok=True)
    
    for img_path in image_paths:
        if img_path.startswith('/'):
            img_path = img_path[1:]
        source_img = os.path.abspath(os.path.join(source_dir, img_path))
        target_img = os.path.abspath(os.path.join(target_dir, img_path))
        
        os.makedirs(os.path.dirname(target_img), exist_ok=True)
        
        if os.path.exists(source_img):
            shutil.copy2(source_img, target_img)
            # print(f"Copied image: {source_img} -> {target_img}")
        else:
            print(f"Warning: Image not found: {source_img}")
    
    return post


def process_thumbnail(post):
    # Choose field based on purpose
    image_field = 'image' if post.metadata.get('purpose') == 'usecase' else 'thumbnail'
    
    if image_field in post.metadata and post.metadata[image_field] is not None:
        # Add /images/ prefix if not already present
        if not post.metadata[image_field].startswith('/images/'):
            post.metadata[image_field] = f"/images/{post.metadata[image_field]}"
        
        # Migrate the image
        img_path = post.metadata[image_field].lstrip('/')  # Remove leading slash
        source_img = os.path.abspath(os.path.join(source_dir, "images/thumbnails" if image_field == "thumbnail" else "images", os.path.basename(post.metadata[image_field])))
        target_img = os.path.abspath(os.path.join(target_dir, img_path))
        
        # Create target directory if it doesn't exist
        os.makedirs(os.path.dirname(target_img), exist_ok=True)
        
        # Copy the image
        if os.path.exists(source_img):
            shutil.copy2(source_img, target_img)
            print(f"Copied image: {source_img} -> {target_img}")
        else:
            print(f"Warning: Image not found: {source_img}")
        
        # For posts with thumbnail, move to image field
        if image_field == 'thumbnail':
            post.metadata['image'] = post.metadata['thumbnail']
            del post.metadata['thumbnail']
    
    return post


def migrate_file(old_path, new_path, content_processors=None, add_title=True):
    source_path = os.path.abspath(os.path.join(source_dir, old_path))
    target_path = os.path.abspath(os.path.join(target_dir, new_path))

    print(f"Moving {source_path} to {target_path}")

    with open(source_path, 'r', encoding='utf-8') as f:
        post = frontmatter.load(f)
    
    if add_title and 'title' in post.metadata:
        post.content = f"# {post.metadata['title']}\n\n{post.content}"
    
    if content_processors:
        if not isinstance(content_processors, list):
            content_processors = [content_processors]
        for processor in content_processors:
            post = processor(post)
        
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(frontmatter.dumps(post))


def remove_script_blocks(post):
    post.content = re.sub(r'<script>.*?</script>', '', post.content, flags=re.DOTALL)
    return post


def remove_image_blocks(post):
    post.content = re.sub(r'<img[^>]*>', '', post.content)
    return post


def remove_lines(post):
    post.content = re.sub(r'---', '', post.content)
    return post


def remove_includes(post, include_file=None):
    if include_file:
        pattern = r'{%\s*include\s+' + re.escape(include_file) + r'\s*%}'
    else:
        pattern = r'{%\s*include\s+[^%}]*\s*%}'
    post.content = re.sub(pattern, '', post.content)
    return post


def migrate_posts(processors):
    posts_dir = os.path.join(source_dir, "_posts", "en")
    for root, dirs, files in os.walk(posts_dir):
        for file in files:
            if file.endswith('.md'):
                source_path = os.path.join("_posts", "en", file)
                
                # Read the file to check its purpose
                with open(os.path.join(source_dir, source_path), 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)
                
                # Determine target folder and processors based on purpose
                if post.metadata.get('purpose') == 'usecase':
                    target_path = os.path.join("_usecases", file)
                    migrate_file(source_path, target_path, processors, add_title=False)
                else:
                    target_path = os.path.join("_posts", file)
                    migrate_file(source_path, target_path, processors, add_title=False)


if __name__ == "__main__":

    update_source_folder()

    # pages
    
    migrate_file("about/visionmission.md", "about/visionmission.md", [remove_script_blocks, remove_image_blocks])
    migrate_file("about/nodes.md", "about/nodes.md", [remove_script_blocks, lambda content: remove_includes(content, "mapfooter.html")])
    migrate_file("about/governance.md", "about/governance.md", [remove_script_blocks])
    migrate_file("about/sponsor.md", "about/partner.md", [remove_script_blocks, migrate_images])

    migrate_file("whatwedo/core-activities.md", "whatwedo/core-activities.md", [remove_script_blocks, migrate_images])
    migrate_file("whatwedo/impact.md", "whatwedo/impact.md", [remove_script_blocks, migrate_images])
    migrate_file("whatwedo/objectives.md", "whatwedo/objectives.md", [remove_script_blocks, migrate_images, remove_includes])

    migrate_file("data/contribute.md", "data/contribute.md", [remove_script_blocks, migrate_images, remove_includes, remove_lines])
    migrate_file("data/quality.md", "data/quality.md", [remove_script_blocks, migrate_images, remove_includes, remove_lines])
    migrate_file("data/cite.md", "data/cite.md", [remove_script_blocks, migrate_images, remove_includes, remove_lines])
    migrate_file("data/datapolicy.md", "data/datapolicy.md", [remove_script_blocks, migrate_images, remove_includes, remove_lines])
    migrate_file("community/coordinationgroups.md", "community/coordinationgroups.md", [remove_script_blocks, migrate_images, remove_includes, remove_lines])

    # posts and usecases

    # migrate_posts([migrate_images, process_thumbnail, remove_includes])
