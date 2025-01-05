const client = require("./db/gameData/db-client");

(async () => {
  try {
    // Connect to the database
    await client.connect();
    console.log("Connected to the database.");

    const stripeCustomerId = "cus_RWoOy2x8YwYMlr";

    // Example: Select all rows from a table
    const { rows } = await client.query(
      `SELECT 
    o.order_id,
    o.order_date,
    o.total_price,
    o.order_status,
    o.receipt_url,
    COALESCE(
        json_agg(
            json_build_object(
                'game_id', oi.game_id,
                'quantity', oi.quantity,
                'title', g.title,
                'price', g.price,
                'sample_cover_thumbnail', g.sample_cover_thumbnail
            )
        ) FILTER (WHERE oi.order_item_id IS NOT NULL),
        '[]'
    ) as items
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN games g ON oi.game_id = g.game_id
WHERE o.stripe_customer_id = $1
GROUP BY o.order_id
ORDER BY o.order_date DESC;`,
      [stripeCustomerId]
    );
    console.log(rows);
    rows.forEach((order) => console.log(order.items));
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    // Disconnect from the database
    await client.end();
    console.log("Disconnected from the database.");
  }
})();
