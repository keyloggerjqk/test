-- Mở rộng MenuMind lên 24 món và thêm đường dẫn ảnh cục bộ.
-- Có thể chạy nhiều lần: dữ liệu được cập nhật theo id, không xóa đơn hàng cũ.

alter table public."menuItems"
  add column if not exists image text not null default '';

insert into public."menuItems"
  (id,name,category,price,time,spicy,vegetarian,available,rating,orders,emoji,image,description,tags)
values
('m01','Cá hồi áp chảo sốt chanh','Món chính',189000,18,0,false,true,4.9,128,'🐟','assets/images/menu/m01.jpg','Cá hồi áp chảo da giòn, sốt chanh bơ, rau xanh và khoai nghiền.',array['giàu đạm','bán chạy']),
('m02','Sườn bò nướng sốt tiêu','Món chính',219000,20,1,false,true,4.8,102,'🥩','assets/images/menu/m02.jpg','Sườn bò nướng mềm, sốt tiêu đen, cà chua và rau củ theo mùa.',array['đậm vị','bán chạy']),
('m03','Salad vườn sốt chanh','Khai vị',89000,9,0,true,true,4.7,88,'🥗','assets/images/menu/m03.jpg','Xà lách non, cà chua bi, bánh mì giòn và sốt chanh mật ong.',array['tươi mát','ít calo']),
('m04','Salad ngũ sắc hạt điều','Món chay',99000,10,0,true,true,4.8,76,'🥗','assets/images/menu/m04.jpg','Rau xanh, bơ, đậu gà, củ quả giòn và sốt mè rang nhà làm.',array['thuần chay','nhiều chất xơ']),
('m05','Mì xào tôm kiểu Thái','Món chính',139000,14,1,false,true,4.7,94,'🍜','assets/images/menu/m05.jpg','Mì xào dai mềm, tôm tươi, giá hẹ và sốt me chua ngọt.',array['hải sản','hơi cay']),
('m06','Cà ri gà kem dừa','Món chính',149000,17,2,false,true,4.6,61,'🍛','assets/images/menu/m06.jpg','Gà mềm nấu cà ri, nước cốt dừa, khoai củ và gia vị ấm.',array['thơm béo','cay vừa']),
('m07','Brownie kem vani','Tráng miệng',69000,7,0,true,true,4.9,143,'🍨','assets/images/menu/m07.jpg','Brownie chocolate ấm dùng cùng kem vani và sốt caramel.',array['ngọt dịu','dùng nóng']),
('m08','Trà đào cam sả','Đồ uống',49000,4,0,true,true,4.6,112,'🍹','assets/images/menu/m08.jpg','Trà đen, đào miếng, cam vàng và sả tươi, phục vụ lạnh.',array['không cồn','thanh mát']),
('m09','Bánh xếp rau củ chiên giòn','Khai vị',79000,9,1,true,true,4.6,67,'🥟','assets/images/menu/m09.jpg','Bánh xếp nhân rau củ, vỏ giòn nhẹ, dùng cùng sốt me cay.',array['món chay','giòn ngon']),
('m10','Mì xào nấm rau củ','Món chay',109000,12,1,true,true,4.7,81,'🍝','assets/images/menu/m10.jpg','Mì trứng xào nấm, cải thìa và rau củ với nước tương ít mặn.',array['món chay','nhanh']),
('m11','Cơm chiên Dương Châu','Món chính',119000,12,0,false,true,4.8,136,'🍚','assets/images/menu/m11.jpg','Cơm chiên tơi hạt cùng tôm, trứng, rau củ và hành lá.',array['phổ biến','không cay']),
('m12','Sushi cá hồi cuộn bơ','Món chính',169000,16,0,false,true,4.9,97,'🍣','assets/images/menu/m12.jpg','Cá hồi tươi, bơ, cơm giấm và rong biển, dùng cùng gừng hồng.',array['hải sản','tươi sống']),
('m13','Pizza gà nướng nấm','Món chính',179000,19,0,false,true,4.7,79,'🍕','assets/images/menu/m13.jpg','Đế bánh mỏng giòn, gà nướng, nấm, hành tím và phô mai mozzarella.',array['chia sẻ','phô mai']),
('m14','Spaghetti hải sản','Món chính',159000,17,1,false,true,4.8,91,'🍝','assets/images/menu/m14.jpg','Mì Ý sốt cà chua, tôm, mực, cà chua bi và thảo mộc.',array['hải sản','kiểu Ý']),
('m15','Cơm gạo lứt ức gà','Món chính',129000,14,0,false,true,4.6,64,'🥙','assets/images/menu/m15.jpg','Gạo lứt, ức gà nướng, cà chua, rau xanh và sốt sữa chua.',array['eat clean','giàu đạm']),
('m16','Bánh mì bơ trứng lòng đào','Bữa sáng',79000,8,0,true,true,4.7,73,'🍳','assets/images/menu/m16.jpg','Bánh mì nướng, bơ nghiền, trứng lòng đào và xà lách non.',array['bữa sáng','nhanh']),
('m17','Pancake dâu việt quất','Tráng miệng',79000,10,0,true,true,4.8,105,'🥞','assets/images/menu/m17.jpg','Pancake mềm, dâu tươi, việt quất, chuối và mật ong.',array['trái cây','ngọt dịu']),
('m18','Cà phê latte','Đồ uống',45000,5,0,true,true,4.8,151,'☕','assets/images/menu/m18.jpg','Espresso rang vừa hòa cùng sữa tươi đánh nóng mịn.',array['cà phê','phục vụ nóng']),
('m19','Mocktail chanh dây','Đồ uống',59000,5,0,true,true,4.5,58,'🍸','assets/images/menu/m19.jpg','Chanh dây, cam, soda và syrup thảo mộc, hoàn toàn không cồn.',array['không cồn','chua ngọt']),
('m20','Bánh kem phúc bồn tử','Tráng miệng',75000,6,0,true,true,4.8,86,'🍰','assets/images/menu/m20.jpg','Cốt bánh vani mềm, kem sữa nhẹ và phúc bồn tử tươi.',array['trái cây','bán chạy']),
('m21','Salad đậu hũ sốt mè','Món chay',109000,11,0,true,true,4.7,69,'🥗','assets/images/menu/m21.jpg','Đậu hũ áp chảo, bắp, bơ, bắp cải tím và sốt mè rang.',array['thuần chay','giàu đạm']),
('m22','Ravioli nấm sốt kem','Món chay',139000,15,0,true,true,4.6,43,'🍝','assets/images/menu/m22.jpg','Pasta nhân nấm, sốt kem thảo mộc và phô mai parmesan.',array['kiểu Ý','thơm béo']),
('m23','Soda dâu chanh','Đồ uống',49000,4,0,true,true,4.7,93,'🥤','assets/images/menu/m23.jpg','Dâu tươi, chanh xanh, bạc hà và soda mát lạnh.',array['không cồn','trái cây']),
('m24','Salad phô mai rau củ','Khai vị',119000,11,0,true,true,4.7,74,'🥗','assets/images/menu/m24.jpg','Xà lách romaine, dưa leo, phô mai, cà chua và sốt thảo mộc.',array['món chay','tươi mát'])
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  price = excluded.price,
  time = excluded.time,
  spicy = excluded.spicy,
  vegetarian = excluded.vegetarian,
  available = excluded.available,
  rating = excluded.rating,
  orders = excluded.orders,
  emoji = excluded.emoji,
  image = excluded.image,
  description = excluded.description,
  tags = excluded.tags;

notify pgrst, 'reload schema';

select id, name, category, price, image
from public."menuItems"
order by id;
