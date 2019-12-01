SELECT tbl_repair_invoices.repair_invoice_id AS repair_id,
    tbl_repair_invoices.repair_invoice_description AS repair_description,
    (tbl_members.member_first_name || ' ' || tbl_members.member_last_name) AS repair_member_name,
    (tbl_employees.employee_first_name || ' ' || tbl_employees.employee_last_name) AS repair_employee_name,
    tbl_repair_status.repair_status_name AS repair_status
FROM tbl_repair_invoices
JOIN tbl_members ON tbl_repair_invoices.customer_id = tbl_members.member_id
JOIN tbl_employees ON tbl_repair_invoices.employee_id = tbl_employees.employee_id
JOIN tbl_repair_status ON tbl_repair_invoices.repair_status_id = tbl_repair_status.repair_status_id
WHERE tbl_repair_invoices.repair_invoice_id = $1;
