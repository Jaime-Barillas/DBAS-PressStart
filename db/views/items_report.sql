CREATE OR REPLACE VIEW items_report AS
SELECT tbl_items.item_name,
       tbl_sale_items.sale_item_quantity,
       tbl_sale_items.sale_item_price,
       tbl_sale_invoices.store_id,
       tbl_sale_invoices.sale_invoice_date
FROM tbl_sale_invoices
JOIN tbl_sale_items ON tbl_sale_invoices.invoice_id = tbl_sale_items.invoice_id
JOIN tbl_items ON tbl_sale_items.item_id = tbl_items.item_id;
