SELECT tbl_reservations.reservation_id,
       (tbl_members.member_first_name || ' ' || tbl_members.member_last_name) AS reservation_member_name,
       tbl_reservations.reservation_date_reserved,
       tbl_reservations.reservation_received,
       tbl_reservations.store_id AS reservation_store_id
FROM tbl_reservations
JOIN tbl_members ON tbl_reservations.member_id = tbl_members.member_id
WHERE
