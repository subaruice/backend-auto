export const getProductsByCategoryId = `
WITH RECURSIVE category_tree AS (
    SELECT categoryID FROM avl_categories WHERE categoryID = ?
    UNION ALL
    SELECT c.categoryID FROM avl_categories c INNER JOIN category_tree ct ON c.parent = ct.categoryID
),
full_products AS (
    SELECT 
        p.*,
        COALESCE(
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'photoID', pp.photoID,
                    'filename', pp.filename,
                    'thumbnail', pp.thumbnail,
                    'enlarged', pp.enlarged
                )
            ),
            JSON_ARRAY()
        ) AS pictures
    FROM avl_products p
    LEFT JOIN avl_category_product cp ON p.productID = cp.productID
    LEFT JOIN avl_product_pictures pp ON p.productID = pp.productID
    WHERE 
        (p.categoryID IN (SELECT categoryID FROM category_tree)
         OR
         cp.categoryID IN (SELECT categoryID FROM category_tree))
        AND p.enabled = 1
    GROUP BY p.productID
)
SELECT * FROM full_products
`;

export const getProductById = `
  SELECT 
  p.*,

  JSON_ARRAYAGG(
    JSON_OBJECT(
      'photoID', pp.photoID,
      'filename', pp.filename,
      'thumbnail', pp.thumbnail,
      'enlarged', pp.enlarged
    )
  ) AS pictures

FROM avl_products p
LEFT JOIN avl_product_pictures pp ON p.productID = pp.productID
WHERE p.productID = ?
GROUP BY p.productID;
`;

export const getAllCategories = `
  SELECT categoryID, name, parent 
  FROM avl_categories 
  ORDER BY name, sort_order;
`;

export const getAllProducts = `
  SELECT p.*,
    JSON_ARRAYAGG(
        JSON_OBJECT(
        'photoID', pp.photoID,
        'filename', pp.filename,
        'thumbnail', pp.thumbnail,
        'enlarged', pp.enlarged
        )
    ) AS pictures

    FROM avl_products p
    LEFT JOIN avl_product_pictures pp ON p.productID = pp.productID
    GROUP BY p.productID
`;
export const getAllSaleProducts = `
    SELECT p.*,
    JSON_ARRAYAGG(
        JSON_OBJECT(
        'photoID', pp.photoID,
        'filename', pp.filename,
        'thumbnail', pp.thumbnail,
        'enlarged', pp.enlarged
        )
    ) AS pictures

    FROM avl_products p
    LEFT JOIN avl_product_pictures pp ON p.productID = pp.productID
    WHERE p.list_price != 0
    GROUP BY p.productID
`;
