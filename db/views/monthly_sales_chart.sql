SELECT item_report_name AS item_name,
       SUM(item_report_price) AS total_revenue
FROM items_report
WHERE items_report.item_report_date > (CURRENT_TIMESTAMP - INTERVAL '1 month')
GROUP BY items_report.item_report_name;
       
