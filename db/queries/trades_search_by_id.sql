SELECT tbl_trade_invoices.trade_invoice_id AS trade_id,
    (tbl_members.member_first_name || ' ' || tbl_members.member_last_name) AS trade_member_name,
    tbl_trade_invoices.trade_invoice_date AS trade_date
FROM tbl_trade_invoices
JOIN tbl_members ON tbl_trade_invoices.member_id = tbl_members.member_id
WHERE tbl_trade_invoices.trade_invoice_id = $1;
