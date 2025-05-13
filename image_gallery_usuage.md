-- 1. Insert a new image
-- This will return the newly-created image_id, its title, description, and timestamp.
SELECT \*
FROM agile_cms.create_image(
'Golden Gate Bridge at Sunset', -- p_title
'A long-exposure shot over the bay.' -- p_description
);

-- 2. Insert a new gallery entry for that image
-- You must pass a JSONB blob for `url`. Here’s a simple example with a single URL:
SELECT \*
FROM agile_cms.create_image_gallery(
1, -- p_image_id (from the row above)
'{"url":"https://example.com/ggb-sunset.jpg"}'::jsonb
);

SELECT _ FROM agile_cms.get_image(1);
SELECT _ FROM agile_cms.list_images();

SELECT _ FROM agile_cms.get_image_gallery(5);
SELECT _ FROM agile_cms.list_image_galleries();
SELECT \* FROM agile_cms.list_image_galleries_by_image(1);
