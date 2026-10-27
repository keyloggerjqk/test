-- Seed data for MenuMind. Run after schema.sql.

insert into public."menuItems" (id,name,category,price,time,spicy,vegetarian,available,rating,orders,emoji,image,description,tags) values
('m01','Cá hồi áp chảo sốt quýt','Món chính',189000,18,0,false,true,4.9,128,'🍊','assets/images/menu/m01.jpg','Cá hồi da giòn, sốt quýt thanh, khoai nghiền và măng tây.',array['ít béo','bán chạy']),
('m02','Bò nướng lá lốt','Món chính',149000,16,1,false,true,4.8,102,'🥩','assets/images/menu/m02.jpg','Bò mềm cuốn lá lốt, bún tươi, rau thơm và nước mắm chua ngọt.',array['đậm vị','không gluten']),
('m03','Gỏi bưởi tôm nướng','Khai vị',119000,10,1,false,true,4.7,88,'🦐','assets/images/menu/m03.jpg','Bưởi hồng, tôm nướng, rau răm và sốt mắm chanh dịu.',array['tươi mát','ít calo']),
('m04','Nấm đùi gà nướng miso','Món chay',99000,14,0,true,true,4.8,76,'🍄','assets/images/menu/m04.jpg','Nấm nướng miso, mè rang, cơm lứt và cải non theo mùa.',array['thuần chay','giàu đạm']),
('m05','Mì Quảng gà thả vườn','Món chính',129000,13,2,false,true,4.7,94,'🍜','assets/images/menu/m05.jpg','Sợi mì nghệ, gà thả vườn, đậu phộng rang và rau sống.',array['đặc sản','hơi cay']),
('m06','Đậu hũ non sốt tiêu xanh','Món chay',89000,12,2,true,true,4.6,61,'🥬','assets/images/menu/m06.jpg','Đậu hũ non, nấm, tiêu xanh Phú Quốc và cơm trắng.',array['thuần chay','cay vừa']),
('m07','Chè sen nhãn dừa','Tráng miệng',59000,6,0,true,true,4.9,143,'🥥','assets/images/menu/m07.jpg','Hạt sen bùi, nhãn lồng và nước dừa tươi ít ngọt.',array['ít ngọt','món lạnh']),
('m08','Trà dứa hương thảo','Đồ uống',49000,4,0,true,false,4.5,55,'🍹','assets/images/menu/m08.jpg','Dứa ép, trà xanh và hương thảo; phục vụ lạnh.',array['không cồn','tạm hết'])
on conflict (id) do nothing;

insert into public."tables" (id,code,zone,seats,status) values
('t01','A01','Cửa sổ',2,'available'),('t02','A02','Cửa sổ',4,'occupied'),('t03','A03','Cửa sổ',4,'reserved'),('t04','A04','Cửa sổ',2,'available'),('t05','A05','Cửa sổ',6,'cleaning'),('t06','A06','Cửa sổ',4,'occupied'),('t07','B01','Vườn',4,'available'),('t08','B02','Vườn',6,'occupied'),('t09','B03','Vườn',2,'available'),('t10','B04','Vườn',4,'occupied'),('t11','C01','Riêng',8,'occupied'),('t12','S01','Quầy',1,'available')
on conflict (id) do nothing;

insert into public.staff (id,name,email,role,status,shift) values
('u01','Minh Anh','minhanh@menumind.vn','kitchen','active','Chiều'),
('u02','Quốc Bảo','quocbao@menumind.vn','kitchen','active','Tối'),
('u03','Thu Hà','thuha@menumind.vn','manager','active','Cả ngày'),
('u04','Hoàng Nam','hoangnam@menumind.vn','admin','active','Cả ngày'),
('u05','Linh Chi','linhchi@menumind.vn','service','inactive','Sáng')
on conflict (id) do nothing;

insert into public.orders (id,"table",status,priority,wait,note,total,items) values
('MM-2410','B04','new',false,6,'Một phần mì không hành',387000,'[{"menuId":"m03","qty":1},{"menuId":"m05","qty":2}]'),
('MM-2409','A02','cooking',true,13,'Cá hồi chín vừa',496000,'[{"menuId":"m01","qty":2},{"menuId":"m07","qty":2}]'),
('MM-2408','C01','cooking',false,17,'Dị ứng đậu phộng',248000,'[{"menuId":"m02","qty":1},{"menuId":"m04","qty":1}]'),
('MM-2407','A06','ready',true,23,'Mang món cùng lúc',387000,'[{"menuId":"m05","qty":3}]'),
('MM-2406','B02','served',false,26,'',237000,'[{"menuId":"m06","qty":2},{"menuId":"m07","qty":1}]'),
('MM-2405','S01','cancelled',false,8,'Khách đổi lịch',149000,'[{"menuId":"m02","qty":1}]')
on conflict (id) do nothing;

insert into public.feedback (id,"orderId","table",rating,text,theme,status) values
('f01','MM-2409','A02',5,'Cá hồi ngon, nhân viên giải thích món rất kỹ.','Món ăn','new'),
('f02','MM-2408','C01',3,'Đồ ăn ổn nhưng chờ món chính hơi lâu.','Thời gian chờ','new'),
('f03','MM-2406','B02',5,'Không gian vườn dễ chịu, món chay nhiều lựa chọn.','Không gian','replied'),
('f04','MM-2407','A06',4,'Mì Quảng đậm vị nhưng hơi cay với trẻ nhỏ.','Khẩu vị','new'),
('f05','MM-2410','B04',2,'Phải nhắc hai lần mới có thêm nước lọc.','Phục vụ','new')
on conflict (id) do nothing;
