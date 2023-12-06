drop database cafeshop;
create database cafeshop;
use cafeshop;

drop table if exists nhanvien;
CREATE TABLE NHANVIEN (
    MaNV INT auto_increment PRIMARY KEY,
    HoVaTen VARCHAR(50) NOT NULL,
    email 	varchar(100) NOT NULL  UNIQUE,
    mk 		varchar(100) not null,
    DiaChi VARCHAR(50),
    NgaySinh DATE,
    SDT VARCHAR(10),
    MaGiamSat INT,
    Luong INT,
	statusNV INT default 1,
    CONSTRAINT fk_NV_GIAMSAT FOREIGN KEY (MaGiamSat) 
        REFERENCES NHANVIEN(MaNV) ON DELETE NO ACTION
)auto_increment 1
auto_increment 1;

drop trigger if exists check_age_and_salary ;
DELIMITER //
CREATE TRIGGER check_age_and_salary 
BEFORE INSERT ON NHANVIEN
FOR EACH ROW
BEGIN
    IF YEAR(NOW()) - YEAR(NEW.NgaySinh) <= 16 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tuổi phải lớn hơn 16.';
    END IF;
    
    IF NEW.Luong < 20000 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lương phải lớn hơn hoặc bằng 20000.';
    END IF;
END//
DELIMITER ;


     
drop table if exists DonHang;
create table DonHang (
	MaDonHang int auto_increment primary key,
	SoLuongMon int  default 0,
	TongGiaGoc int default 0,
	TongGiaSauUuDai int default 0
)auto_increment 1
auto_increment 1;



drop table if exists dondattruoc;
create table DonDatTruoc (
	MaDonHang int primary key,
	MaBan	int,
    constraint Fk_dondattruoc foreign key (MaDonHang) references DonHang(MaDonHang) on delete cascade 
);


    
drop table if exists donhangcanhan;
create table DonHangCaNhan (
	MaDonHang int not null primary key,
	MaKhachHang int not null,
	Sothe int,
     constraint Fk_donhangcanhan foreign key (MaDonHang) references DonHang(MaDonHang) on delete cascade 
);

    
drop table if exists hoadon;
CREATE TABLE HOADON ( 
	MaHD INT  auto_increment primary KEY,
    tongGia	int	default 0
)auto_increment 1 auto_increment 1; 


drop table if exists xuat;
CREATE TABLE XUAT
( MaNV INT NOT NULL,
MaHD INT NOT NULL,
MaDH int NOT NULL,
NgayXuat DATE ,
GioXuat TIME,
PRIMARY KEY(MaNV, MaHD, MaDH),
CONSTRAINT 	fk_X_NHANVIEN	FOREIGN KEY (MaNV) 
				REFERENCES NHANVIEN(MaNV),
CONSTRAINT 	fk_X_HOADON	FOREIGN KEY (MaHD) 
				REFERENCES HOADON(MaHD),
CONSTRAINT 	fk_X_DONHANG	FOREIGN KEY (MaDH) 
				REFERENCES DonHang(MaDonHang)
);
-- trigger dùng để cập nhật tổng tiền trong hóa đơn
drop trigger if exists updateHoaDon;
delimiter //
create trigger updateHoaDon
before insert on xuat
for each row
begin
	declare price int;
    
    select tongGiaSauUuDai into price
    from donhang
    where madonhang = new.MaDH;
    
    update hoadon
    set tonggia = price
    where MaHD=new.MaHD;
end //
delimiter ;
-- trigger dùng để xóa hóa đơn
drop trigger if exists setdefaultHoaDon;
delimiter //
create trigger setdefaultHoaDon
before delete on xuat
for each row
begin
    update hoadon
    set tonggia = 0
    where MaHD=old.MaHD;
end //
delimiter ;
    



drop table if exists VOUCHER_TYPE;
CREATE TABLE VOUCHER_TYPE(
	id							INT				auto_increment  KEY,
	discount_percent			INT				not null,
	note						VARCHAR(200)	,
	max_discount				INT,
	number						INT  default '0'

) auto_increment 1
auto_increment 1;



    
drop table if exists VOUCHER_CARD;
CREATE TABLE VOUCHER_CARD(
	id							INT,
	STT						INT		,
    current_status		int default 1,
	PRIMARY KEY(id,STT),
	constraint Fk_voucher_card foreign key (id) references VOUCHER_TYPE(id) ON DELETE CASCADE
) ;
-- trigger cập nhật số lượng loại voucher tương ứng khi một thẻ voucher được thêm
DROP TRIGGER IF EXISTS add_voucher_num;
DELIMITER //
create trigger add_voucher_num
after insert on VOUCHER_CARD 
for each row
begin
	
	update VOUCHER_TYPE
	SET number=number+1
	WHERE VOUCHER_TYPE.id = new.id;
end //
DELIMITER ;
-- trigger cập nhật số lượng loại voucher tương ứng khi một thẻ voucher bị xóa
DROP TRIGGER IF EXISTS delete_voucher_num;
delimiter //
create trigger delete_voucher_num
before delete on  VOUCHER_CARD
for each row
begin
	update VOUCHER_TYPE
    SET number=number-1
    where VOUCHER_TYPE.id = old.id;
end //
delimiter ;
-- bởi vì trong nghiệp vụ chỉ có thêm hoặc xóa vào bảng voucher_card. Bảng này chỉ được tạo ra để quản lí chính xác số lượng thẻ voucher cho mỗi loại voucher nên chỉ có hai thao tác chính là thêm và xóa.

-- thủ tục này kiểm tra thẻ voucher đang muốn thêm đã có sẵn và đang khả dụng trong cửa hàng hay không mà đưa ra cách xử lí hợp lí
-- input: mã voucher, số thứ tự thẻ voucher
-- kết quả: thẻ đã được thêm hoặc cập nhật trạng thái phù hợp
drop procedure if exists addVoucher_card;
delimiter //
create procedure addVoucher_card (voucher_id int , STT_voucher int)
begin
	declare checkExist int ;
    declare state int;
    set state =2;
    set checkExist =0;
    drop temporary table if exists t3;
    create temporary table t3 as
    select *
    from voucher_card
    where id = voucher_id and STT = STT_voucher;
    
    select count(*) into checkExist
    from t3;
    
    if (checkExist = 1) then
		select current_status into state
        from t3;
        
        if (state =0) then SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'thẻ voucher đã được sử dụng';
			
		else  SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'thẻ voucher đang có sẵn';
		end if;   
	else 
		insert into voucher_card (id,STT) values (voucher_id, STT_voucher);
	end if;
end //
delimiter ;
-- thủ tục xóa voucher_card
drop procedure if exists  deleteVoucher_card;
delimiter //
create procedure deleteVoucher_card (voucher_id int, STT_voucher int)
begin
	declare state int ;
    select current_status into state
    from voucher_card
    where id = voucher_id and STT = STT_voucher;
    if (state =1) then
		update voucher_card
		set current_status =0
		where id = voucher_id and STT = STT_voucher;
        
        update voucher_type
        set number = number -1
        where id = voucher_id;
	elseif (state =0 ) then SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'thẻ đang không khả dụng';
    else SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'thẻ không tồn tại';
	end if;
end //
delimiter ;
    


drop table if exists voucher_effective_time;
CREATE TABLE VOUCHER_EFFECTIVE_TIME(
	id							INT	Primary key,
	start_time					DATE,
	end_time					DATE,
	constraint Fk_effective_time foreign key (id) references VOUCHER_TYPE(id)  ON DELETE CASCADE
);

  
drop table if exists payment_apply;
CREATE TABLE PAYMENT_APPLY(
	order_id					INT  unique not null,
	STT_voucher					INT,
	id_voucher					INT,
	PRIMARY KEY(STT_voucher,id_voucher),	
    constraint Fk_payment_apply1 foreign key (id_voucher,STT_voucher) references VOUCHER_CARD(id,STT)  ON DELETE CASCADE,
	constraint Fk_payment_apply2 foreign key (order_id) references DonHang(MaDonHang)  ON DELETE CASCADE
	
);


drop table if exists customers;
CREATE TABLE customers (
    ID INT auto_increment  PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(300) NOT NULL,
	CONSTRAINT uniqueCustomer UNIQUE(name, address)
)auto_increment=1
auto_increment=1;

    
drop table if exists customerPN;
CREATE TABLE customerPN (
	id INT NOT NULL auto_increment PRIMARY KEY,
    customerID INT NOT NULL,
    phoneNumber VARCHAR(50) NOT NULL,
    FOREIGN KEY (customerID) REFERENCES customers(ID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT phoneLength CHECK (length(phoneNumber) >= 10 AND length(phoneNumber) <= 11)
) auto_increment 1
	auto_increment 1;

drop table if exists bookingTables;
CREATE TABLE bookingTables (
    ID INT auto_increment PRIMARY KEY,
    seats INT NOT NULL,
    current_status INT NOT NULL DEFAULT 1 ,
	CONSTRAINT enum_current_status	CHECK(current_status in ('0','1'))
)auto_increment 1
auto_increment 1;


drop table if exists bookingInfo;
CREATE TABLE bookingInfo (
	ID INT auto_increment PRIMARY KEY,
	fk_tableID INT  DEFAULT 0,
	fk_customerID INT  DEFAULT 0,
	orderDate DATE NOT NULL,
    orderTime time not null,
    startDate date not null,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    CONSTRAINT startTime_endTime CHECK (startTime < endTime),
	constraint Fk_booking1 FOREIGN KEY (fk_tableID) REFERENCES bookingTables(ID) ON DELETE SET null ON UPDATE CASCADE,
	constraint Fk_booking2 FOREIGN KEY (fk_customerID) REFERENCES customers(ID) ON DELETE SET null ON UPDATE CASCADE
);
 
drop table if exists LoaiMon;
CREATE TABLE LoaiMon (
    Maloaimon	int	auto_increment	not null,
    Mota	varchar(255),
    Ten		varchar(50)	not null,
    Giobatdau	Time,
    Gioketthuc	Time,
    Loaimon	varchar(255) not null	DEFAULT 'Do uong',
    CONSTRAINT 	enum_Loai_mon	CHECK(Loaimon in ('Do an', 'Do uong')),
    PRIMARY KEY (Maloaimon)
) auto_increment 1
auto_increment 1;

drop table if exists mon;
CREATE TABLE Mon (
    Maloaimon	int not null,
    
    Kichco	varchar(255) not null	DEFAULT 'M',
    Dongia	int not null,
    current_status	int	default 1 ,
    CONSTRAINT enum_Kich_co1	CHECK(Kichco in ('M','L','XL')),
    CONSTRAINT fk_Ma_loai_mon	FOREIGN KEY (Maloaimon)
    				REFERENCES loaimon(Maloaimon) ON DELETE CASCADE,
    PRIMARY KEY (Maloaimon, Kichco)
);
-- thủ tục giúp xóa món trong cửa hàng bằng cách cho current_status = 0
delimiter //
create procedure xoamon	(dish_id int,	size	char(1))
begin
	update mon
    set current_status = 0
    where maloaimon=dish_id and kichco = size;
end //
delimiter ;
-- thủ tục thêm hoặc cập nhật món mới vào của hàng
-- input: mã món, kích cỡ, giá
-- kết quả: nếu món đã tồn tại thì cập nhật lại đơn giá, ngược lại thì insert món vào bảng mon
drop procedure if exists themmon;
delimiter //

create procedure themmon (dish_id int,	size	char(2), price int)
begin
	if exists (select maloaimon, Kichco from mon where maloaimon = dish_id and Kichco = size) THEN
		 update mon set current_status = 1, dongia = price where maloaimon = dish_id and Kichco = size;
	else INSERT INTO mon (maloaimon, kichco, dongia)
		VALUES (dish_id, size, price);
	end if;
end //
delimiter ;


CREATE TABLE thuocvemon (
	Mamon	int not null,
    Madonhang	int not null,
    Kichco	char(1) not null	DEFAULT 'M',
    Giatheongay	int not null,
    Soluong	int not null,
    CONSTRAINT 	enum_Kich_co2	CHECK(Kichco in ('M','L','XL')),
    CONSTRAINT 	fk_Ma_don_hang	FOREIGN KEY (Madonhang) REFERENCEs donhang(madonhang) ON DELETE CASCADE,
    CONSTRAINT  fk_thuocvemon		FOREIGN KEY (Mamon, Kichco)
 				REFERENCES mon(Maloaimon, Kichco) ON DELETE CASCADE,
    PRIMARY KEY (Mamon, Madonhang, Kichco)
);

-- tạo thủ tục in ra thông tin đơn hàng cá nhân, thông qua ma đơn hàng

drop procedure if exists showOrderInfo;
delimiter //
create procedure showOrderInfo( order_id int)
begin
	select Mamon, Ten as TenMon,Kichco,Soluong,giatheongay,(Soluong*giatheongay) as  tong_gia
    from thuocvemon, loaimon
    where Madonhang=order_id and mamon=Maloaimon;
end //
delimiter ;


-- tạo trigger cập nhật tổng giá gốc và tổng số lượng trong đơn hàng khi thêm hàng vào thuocvemon
drop trigger if exists afterIncreaseThuocvemon
delimiter //
create trigger afterIncreaseThuocvemon
after insert on thuocvemon
for each row
begin
	declare voucher_id2 int;
	select id_voucher into voucher_id2
    from payment_apply
    where order_id = new.madonhang;
	if ( voucher_id2 is not null) then call tinhTongGiaUuDai (voucher_id2, new.madonhang);
    end if;
	call TongGiaVaTongMon(new.madonhang);
end//
delimiter ;
-- tạo trigger cập nhật tổng giá gốc và tổng số lượng trong đơn hàng khi xóa hàng từ thuocvemon
drop trigger if exists afterDeleteThuocvemon;
delimiter //
create trigger afterDeleteThuocvemon
after delete on thuocvemon
for each row
begin
	declare voucher_id int;
    select id_voucher into voucher_id
    from payment_apply
    where order_id = old.madonhang;
    if ( voucher_id is not null) then call tinhTongGiaUuDai (voucher_id, old.madonhang);
    end if;
	call TongGiaVaTongMon (old.madonhang);
end//
delimiter ;
-- tạo trigger cập nhật tổng giá gốc và tổng số lượng và tổng trong đơn hàng khi sửa hàng trong thuocvemon
drop trigger if exists afterUpdateThuocvemon;
delimiter //
create trigger afterUpdateThuocvemon
after update on thuocvemon
for each row
begin
	declare voucher_id1 int;
    declare voucher_id2 int;
    
    select id_voucher into voucher_id1
    from payment_apply
    where order_id = old.madonhang;
    if ( voucher_id1 is not null) then call tinhTongGiaUuDai (voucher_id1, old.madonhang);
    end if;
    
    select id_voucher into voucher_id2
    from payment_apply
    where order_id = new.madonhang;
	if ( voucher_id2 is not null) then call tinhTongGiaUuDai (voucher_id2, new.madonhang);
    end if;
    call TongGiaVaTongMon (old.madonhang);
	call TongGiaVaTongMon (new.madonhang);
end//
delimiter ;
-- thủ tục cập nhật thuộc tính tổng giá gốc, số lượng món
drop procedure if exists TongGiaVaTongMon;
delimiter //
create procedure TongGiaVaTongMon(orderId int )
begin 
	DECLARE totalCount INT DEFAULT 0;
    DECLARE totalPrice INT DEFAULT 0;
    select sum(soluong) into totalCount
    from thuocvemon
    where madonhang=orderId
    group by madonhang;
    
	select sum(soluong*giatheongay) into totalPrice
    from thuocvemon
    where madonhang=orderId
    group by madonhang;
   
    update donhang
    set soluongmon = totalCount, tonggiagoc = totalPrice
    where madonhang = orderId;

end //
delimiter ;
-- produre hiển thì danh sách các loại món chưa có món (chưa có món hoặc chỉ có các món có current_status = 0)
delimiter //
create procedure showLoaiMonRong()
begin
	drop temporary table if exists t4;
	create temporary table t4 as
	select * 
    from loaimon
    where (select count(*) from mon where loaimon.maloaimon=mon.maloaimon) > (select  count(*) from mon where loaimon.maloaimon=mon.maloaimon and mon.current_status = 0);
	
    select *
    from loaimon
    where loaimon.maloaimon not in (select t4.maloaimon from t4);
end //
delimiter ;



	
		
    
    
CREATE TABLE dieukienapdung (
    Maloaimon	int not null,
    Mavoucher	int not null,
    Kichco		char(1) not null	DEFAULT 'M',
    minNum		int not null,
    CONSTRAINT 	enum_Kich_co3	CHECK(Kichco in ('M','L','XL')),
    CONSTRAINT  fk_dkapdung		FOREIGN KEY (Maloaimon, Kichco)
 				REFERENCES mon(Maloaimon, Kichco) ON DELETE CASCADE,
    CONSTRAINT	fk_Voucher	FOREIGN KEY (Mavoucher)
				REFERENCES VOUCHER_TYPE(id),
    PRIMARY KEY (Maloaimon, Mavoucher, Kichco)
);
-- trigger kích hoạt sau khi thêm hàng vào payment apply
-- kết quả: thuộc tính tổng giá sau ưu đãi đã được cập nhật 
drop trigger if exists  afterInsertPaymentApply;
delimiter //
create trigger afterInsertPaymentApply
after insert on payment_apply
for each row
begin
	call tinhTongGiaUuDai (new.id_voucher, new.order_id);
end //
delimiter ;

-- trigger kích hoat sau khi thay đổi hàng trong payment apply
-- kết quả: thuộc tính tổng giá sau ưu đãi đã được cập nhật 
drop trigger if exists  afterUdatePaymentApply;
delimiter //
create trigger afterUdatePaymentApply
after update on payment_apply
for each row
begin
	call tinhTongGiaUuDai (null, old.order_id);
	call tinhTongGiaUuDai (new.id_voucher, new.order_id);
end //
delimiter ;

-- trigger kích hoạt sau khi xóa hàng trong payment apply (một đơn hàng không còn được áp dụng voucher nữa)
-- kết quả: thuộc tính tổng giá sau ưu đãi đã được cập nhật 
drop trigger if exists  afterDeletePaymentApply;
delimiter //
create trigger afterDeletePaymentApply
after delete on payment_apply
for each row
begin
	update donhang
    set tongGiaSauUuDai = tongGiaGoc
    where MaDonHang = old.order_id;
end //
delimiter ;
-- thủ tục update thuộc tính tổng giá sau ưu đãi của đơn hàng sau khi áp dụng voucher 
-- input: mã voucher, mã đơn hàng
-- output: thuộc tính tổng giá sau ưu đãi đã được cập nhật
drop procedure if exists tinhTongGiaUuDai;
delimiter //
create procedure tinhTongGiaUuDai (voucher_id int , order_id int)
begin
	declare applyCondition int ;
    declare priceWithVoucher int;
    declare discount_total_percent int default 0;
    declare discount_max int default 0;
    
    select tonggiagoc into priceWithVoucher
    from donhang
    where donhang.Madonhang=order_id;
    
    drop temporary table if exists t1;
	create temporary table t1 as
	select * 
	from dieukienapdung,voucher_effective_time
	where mavoucher=voucher_id and current_date()>= start_time and current_date()<= end_time;
	
     drop temporary table if exists t2;
    create temporary table t2 as
	select *
	from thuocvemon
	where madonhang=order_id;
    
     drop temporary table if exists t3;
	create temporary table t3 as
	SELECT t1.Maloaimon,t2.Kichco,t2.soluong,t1.minNum
	FROM t1 JOIN t2 ON t1.Kichco = t2.Kichco AND t1.Maloaimon = t2.Mamon;
    
    select count(*) into applyCondition
    from t3
    where soluong >= minNum;
    
    if (applyCondition > 0) then
		select discount_percent into discount_total_percent
        from voucher_type
        where id=voucher_id;
        
        select voucher_type.max_discount into discount_max
        from voucher_type
        where id=voucher_id;
        
        
	end if;
    
    if (priceWithVoucher*discount_total_percent/100 > discount_max) then 
			set priceWithVoucher=priceWithVoucher-discount_max;
		else 
			set priceWithVoucher=priceWithVoucher-priceWithVoucher*discount_total_percent/100;
	end if;
    
    update donhang
    set tonggiasauUuDai = priceWithVoucher
    where madonhang=order_id;
end //
delimiter ;
-- Bổ sung BTL2
-- Thủ tục thêm nhân viên
DELIMITER //

CREATE PROCEDURE ThemNhanVien(
    IN HoVaTenParam VARCHAR(50),
    IN EmailParam VARCHAR(100),
    IN MatKhauParam VARCHAR(100),
    IN DiaChiParam VARCHAR(50),
    IN NgaySinhParam DATE,
    IN SDTParam VARCHAR(10),
    IN MaGiamSatParam INT,
    IN LuongParam INT
)
BEGIN
    DECLARE age INT;
    
    SET age = YEAR(NOW()) - YEAR(NgaySinhParam);

    IF age <= 16 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tuổi phải lớn hơn 16.';
    END IF;

    IF LuongParam < 20000 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lương phải lớn hơn hoặc bằng 20000.';
    END IF;

    INSERT INTO NHANVIEN
    SET HoVaTen = HoVaTenParam,
        email = EmailParam,
        mk = MatKhauParam,
        DiaChi = DiaChiParam,
        NgaySinh = NgaySinhParam,
        SDT = SDTParam,
        MaGiamSat = MaGiamSatParam,
        Luong = LuongParam;
END //

DELIMITER ;
-- thủ tục xóa nhân viên
DELIMITER //

CREATE PROCEDURE XoaNhanVien(
    IN MaNVParam INT
)
BEGIN
    UPDATE NHANVIEN SET statusNV = 0 WHERE MaNV = MaNVParam;
END //

DELIMITER ;
-- thủ tục giúp admin sửa lương và mã giám sát của nhân viên
DELIMITER //
CREATE PROCEDURE SuaLuongVaMaGiamSatNhanVien(
    IN MaNVParam INT,
    IN LuongMoi INT,
    IN MaGiamSatMoi INT
)
BEGIN
    IF MaGiamSatMoi = MaNVParam THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Mã giám sát mới không được trùng với mã nhân viên.';
    END IF;

    IF LuongMoi < 20000 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lương phải lớn hơn hoặc bằng 20000.';
    END IF;

    IF MaGiamSatMoi IS NOT NULL AND NOT EXISTS (SELECT 1 FROM NHANVIEN WHERE MaNV = MaGiamSatMoi AND statusNV = 1) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Mã giám sát không tồn tại hoặc đã nghỉ việc.';
    END IF;

    IF (SELECT statusNV FROM NHANVIEN WHERE MaNV = MaNVParam) = 1 THEN
        UPDATE NHANVIEN
        SET Luong = LuongMoi,
            MaGiamSat = MaGiamSatMoi
        WHERE MaNV = MaNVParam;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nhân viên đã nghỉ việc.';
    END IF;
END //

DELIMITER ;


DELIMITER //
-- thủ tục giúp nhân viên tự sửa thông tin cá nhân của bản thân (ngoại trừ lương và mã giám sát)
DELIMITER //

CREATE PROCEDURE SuaThongTinNhanVien(
    IN MaNVParam INT,
    IN HoVaTenParam VARCHAR(50),
    IN EmailParam VARCHAR(100),
    IN MatKhauParam VARCHAR(100),
    IN DiaChiParam VARCHAR(50),
    IN NgaySinhParam DATE,
    IN SDTParam VARCHAR(10)
)
BEGIN
    DECLARE age INT;
    
    SET age = YEAR(NOW()) - YEAR(NgaySinhParam);

    IF age <= 16 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tuổi phải lớn hơn 16.';
    END IF;

    IF (SELECT statusNV FROM NHANVIEN WHERE MaNV = MaNVParam) = 1 THEN
        UPDATE NHANVIEN
        SET HoVaTen = HoVaTenParam,
            email = EmailParam,
            mk = MatKhauParam,
            DiaChi = DiaChiParam,
            NgaySinh = NgaySinhParam,
            SDT = SDTParam
        WHERE MaNV = MaNVParam;
    ELSE
        SELECT 'Nhân viên đã nghỉ việc';
    END IF;
END //

DELIMITER ;

-- thủ tục in ra thông tin của nhân viên và số hóa đơn mà nhân viên đó đã xuất với điều kiện nhân viên đó phải có số tiền lương không vượt quá số tiền đã nhập
-- input: Lương tối đa
-- output: Bảng gồm mã nhân viên, họ và tên, Lương, Số lượng hóa đơn
DELIMITER //

CREATE PROCEDURE InThongTinNhanVienVaHoaDon(
    IN LuongToiDa INT
)
BEGIN
    SELECT
        NV.MaNV as id,
        NV.HoVaTen as HoVaTen,
        NV.Luong as Luong,
        COUNT(X.MaDH) AS SoLuongHoaDon
    FROM
        NHANVIEN NV
    LEFT JOIN
        XUAT X ON NV.MaNV = X.MaNV
    WHERE
        NV.Luong <= LuongToiDa AND NV.statusNV = 1
    GROUP BY
        NV.MaNV
    ORDER BY
	NV.MaNV;
END //

DELIMITER ;

-- Hàm trả về tổng doanh thu của một bàn trong một khoảng thời gian
-- input: mã bàn, ngày bắt đầu, giờ bắt đầu, ngày kết thúc, giờ kết thúc
-- output: tổng tiền thu được trong khoảng thời gian đã nhập
DELIMITER //
CREATE FUNCTION TongTienTheoBan(
    MaBanParam INT,
    NgayBatDauParam DATE,
    GioBatDauParam TIME,
    NgayKetThucParam DATE,
    GioKetThucParam TIME
)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE TongTien INT;


    CREATE TEMPORARY TABLE TempTable
    AS
    SELECT
        COALESCE(DH.TongGiaSauUuDai, 0) AS TongGiaSauUuDai
    FROM
        bookingTables BT
    JOIN
        DonDatTruoc DDT ON BT.ID = DDT.MaBan
    JOIN
        bookingInfo BI ON BT.ID = BI.fk_tableID
    JOIN
        DonHang DH ON DDT.MaDonHang = DH.MaDonHang
    WHERE
        BT.ID = MaBanParam
        AND (BI.startDate > NgayBatDauParam 
			OR (BI.startDate = NgayBatDauParam 
				AND BI.startTime >= GioBatDauParam))
		AND (BI.startDate < NgayKetThucParam 
			OR (BI.startDate = NgayKetThucParam 
				AND BI.endTime <= GioKetThucParam));




    SELECT SUM(TongGiaSauUuDai) INTO TongTien FROM TempTable;


    DROP TEMPORARY TABLE IF EXISTS TempTable;


    RETURN COALESCE(TongTien, 0);
END //
DELIMITER ;


-- Hàm này tính toán tổng số doanh thu của một người khách đã đóng góp cho của hàng và trả về chuỗi thông báo quy định sẵn cho mỗi mức độ đóng góp tương ứng của khách
-- Input: mã khách hàng 
-- Output: chuỗi kí tự thể hiện mức độ đóng góp của khách
DELIMITER //

CREATE FUNCTION MucDoDongGopCustomer(
    MaKhachHangParam INT
) 
RETURNS VARCHAR(50)
READS SQL DATA
BEGIN
    DECLARE TongTien INT;

    SELECT 
        SUM(DH.TongGiaSauUuDai) INTO TongTien
    FROM 
        DonHang DH
    JOIN 
        DonHangCaNhan DHCN ON DH.MaDonHang = DHCN.MaDonHang
    WHERE 
        DHCN.MaKhachHang = MaKhachHangParam;

    IF TongTien >= 3000000 THEN
        RETURN 'VIP_Customer';
    ELSEIF TongTien >= 500000 THEN
        RETURN 'normal_customer';
    ELSE
        RETURN 'new_customer';
    END IF;
END //

DELIMITER ;
-- thủ tục tìm kiếm nhân viên theo tên
DELIMITER //
CREATE PROCEDURE TimKiemNhanVien(
    IN TuKhoa VARCHAR(50)
)
BEGIN
    SELECT *
    FROM NHANVIEN
    WHERE HoVaTen LIKE CONCAT('%', TuKhoa, '%');
END //
DELIMITER ;

-- thủ tục sắp xếp nhân viên theo thứ tự alphabet của tên
DELIMITER //
CREATE PROCEDURE SapXepNhanVienTheoTen()
BEGIN
    SELECT
        *
    FROM
        NHANVIEN
    WHERE
        statusNV = 1
    ORDER BY
        SUBSTRING_INDEX(HoVaTen, ' ', -1) COLLATE utf8mb4_unicode_ci;
END //

delimiter ;

-- thêm các khóa ngoại còn thiếu
alter table dondattruoc add constraint Fk_dondattruoc1 foreign key (maban) references bookingTables(ID) on delete set null;
alter table DonHangCaNhan add constraint Fk_donhangcanhan1 foreign key (MaKhachHang) references customers(ID) on delete cascade;
-- hàm giúp tạo đơn hàng cá nhân khi có khách vào, đồng thời validate thẻ voucher mà khách sử dụng (nếu có)
-- input: tên khách hàng, địa chỉ, số thẻ (của đơn hàng cá nhân), mã voucher , STT tương ứng của voucher
-- output: mã đơn hàng mới vừa được tạo ra cho khách
delimiter //
create function insertAndGetID (
	tenKH	varchar(100),
    diachi	varchar(200),
    sothe	int,
    id_voucher int ,
    STT_voucher int
    
)
returns int
reads sql data
begin
	declare khachID	int;
    declare	donhangID int;
    declare existsCustomer int;
    declare check_voucher int;
    declare state int; 
    declare start_date date;
	declare end_date date;
 

    -- kiểm tra khách hàng này đã từng mua ở cửa hàng chưa
    drop temporary table if exists s1;
    create temporary table s1 as
    select * from customers 
    where name = tenKH and address = diachi;

	select count(*) into existsCustomer
    from s1;
    -- lấy ID của khách vừa đặt hàng
    if ( existsCustomer=0) then
		insert into customers (name,address) values (tenKH,diachi);
		select max(ID) into khachID
		from customers;
	else
        select ID into khachID
        from s1;
	end if;
    
    
    
    -- tạo đơn hàng mới và lấy mã đơn hàng
    insert into donhang() values ();
    select max(MaDonHang) into donhangID
    from donhang;
    -- tạo đơn hàng cá nhân từ ID khách, số thẻ, ID đơn hàng
    insert into donhangcanhan values (donhangID,khachID,sothe);
    -- kiểm tra có áp dụng được voucher hay không
    if (id_voucher is not null and STT_voucher is not null) then 
		select count(*) into check_voucher
        from voucher_card
        where voucher_card.id=id_voucher and STT_voucher=voucher_card.STT;
        
        -- validate voucher có tồn tại trong hệ thống hay không
        if (check_voucher=1) then
			-- lấy tình trạng hiện tại của thẻ voucher
			select  current_status into state
			from voucher_card
			where voucher_card.id=id_voucher and STT_voucher=voucher_card.STT;
            -- lấy thời gian bắt đầu sử dụng của thẻ voucher
			select start_time into start_date
            from voucher_effective_time
            where id = id_voucher ;
             -- lấy thời gian kết thúc sử dụng của thẻ voucher
			select end_time into end_date
            from voucher_effective_time
            where id = id_voucher ;
            -- validate thẻ voucher có khả năng sử dụng không
            if (state = 0) then SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'thẻ voucher đã qua sử dụng';
			elseif (current_date() > end_date) then SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'thẻ voucher đã hết hạn';
            elseif (current_date() < start_date) then SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'thẻ voucher chưa khả dụng';
			end if;
		else  SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'thẻ voucher không tồn tại';
		end if;	
	end if;
    return donhangID;
        
end //
delimiter ;
-- thủ tục dùng thẻ voucher để áp dụng thanh toán cho đơn hàng
delimiter //
create procedure applyVoucherForOrder ( order_id int,  id_voucher int,STT_voucher int)
begin
	insert into payment_apply values (order_id, STT_voucher, id_voucher);
    call deleteVoucher_card(id_voucher,STT_voucher);
end //
delimiter ;


INSERT INTO NHANVIEN (hovaten,email,mk,diachi,ngaysinh,sdt,magiamsat,luong)
VALUES
	 ( 'Nguyen Minh Diem','minhdiem@gmail.com','123456', 'Tp.A', '1990-01-19', '0909110000',null, 50000),
	( 'Vo Van Kha','vankha@gmail.com','123456', 'Tp.A', '2000-01-01', '0909120000', 1, 20000),
	 ('Nguyen Le Phuc','lephuc@gmail.com','123456','Tp.A','2000-02-01','0909130000',1,20000),
     ('Le Nguyen Chuong','chuongle@gmail.com','123456','Tp.A','2000-02-01','0909130000',1,20000),
     ('Ho Huy Hoang','huyhoang@gmail.com','123456','Tp.A','2000-02-01','0909130000',1,20000),
     ('Nguyen Van A', 'vana@gmail.com', 'password123', 'Hanoi', '1995-05-10', '0912345678', NULL, 45000),
    ('Tran Thi B', 'thib@gmail.com', 'secret456', 'Ho Chi Minh City', '1990-03-15', '0987654321', 2, 30000),
    ('Le Van C', 'levc@gmail.com', 'mypassword', 'Da Nang', '1988-12-20', '0901122334', 1, 40000),
    ('Pham Thi D', 'phamd@gmail.com', 'securepass', 'Hue', '1993-07-01', '0978123456', 3, 35000),
    ('Hoang Van E', 'hoange@gmail.com', 'topsecret', 'Can Tho', '1998-11-25', '0918765432', 2, 28000),
    ('Tran Van F', 'tranf@gmail.com', 'myp@ss', 'Hai Phong', '1992-09-03', '0965432109', 1, 38000),
    ('Nguyen Thi G', 'nguyeng@gmail.com', 'password123', 'Quang Ninh', '1996-02-28', '0932111222', 3, 32000),
    ('Le Van H', 'leh@gmail.com', 'secretp@ss', 'Vinh', '1985-06-07', '0945678901', NULL, 50000),
    ('Pham Van I', 'phami@gmail.com', 'myp@ssword', 'Dak Lak', '1987-04-12', '0923456789', 2, 42000),
    ('Ho Thi K', 'hok@gmail.com', 'mysecret', 'Nha Trang', '1991-10-15', '0909876543', 1, 37000),
    ('Vo Van L', 'vol@gmail.com', 'secure123', 'Buon Ma Thuot', '1997-08-20', '0956789012', 3, 31000),
    ('Le Van M', 'lem@gmail.com', 'p@ssword', 'Can Tho', '1994-01-05', '0978123456', 2, 34000),
    ('Nguyen Van N', 'nguyenn@gmail.com', 'password123', 'Ha Long', '1989-12-30', '0912345678', NULL, 46000),
    ('Tran Van P', 'tranp@gmail.com', 'myp@ss', 'Hai Phong', '1990-05-25', '0934567890', 1, 39000),
    ('Pham Thi Q', 'phamq@gmail.com', 'secretp@ss', 'Da Nang', '1993-09-18', '0967890123', 3, 33000);
    
INSERT INTO DonHang VALUES
	(),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    ();
    
-- Bổ sung dữ liệu vào bảng HoaDon
INSERT INTO HoaDon VALUES
	(),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    (),
    ();


    
-- Insert dữ liệu vào bảng customers
INSERT INTO customers (name, address) VALUES
    ('John Doe', '123 Main Street, CityA'),
    ('Jane Smith', '456 Oak Avenue, CityB'),
    ('Mike Johnson', '789 Pine Road, CityC'),
    ('Emily Davis', '101 Maple Lane, CityD'),
    ('Robert Wilson', '202 Cedar Street, CityE'),
    ('Emma Brown', '303 Birch Boulevard, CityF'),
    ('Daniel Lee', '404 Elm Drive, CityG'),
    ('Sophia Taylor', '505 Walnut Circle, CityH'),
    ('Christopher Martin', '606 Cherry Lane, CityI'),
    ('Olivia Anderson', '707 Sycamore Court, CityJ'),
    ('William Moore', '808 Redwood Place, CityK'),
    ('Ella Garcia', '909 Hemlock Street, CityL'),
    ('James Rodriguez', '123 Pineapple Avenue, CityM'),
    ('Ava Hernandez', '456 Banana Road, CityN'),
    ('Liam Martinez', '789 Orange Lane, CityO'),
    ('Isabella Johnson', '101 Strawberry Drive, CityP'),
    ('Mia Davis', '202 Raspberry Boulevard, CityQ'),
    ('Noah Wilson', '303 Blueberry Circle, CityR'),
    ('Amelia Brown', '404 Grape Lane, CityS'),
    ('Logan Lee', '505 Mango Court, CityT');

-- Insert dữ liệu vào bảng customerPN
INSERT INTO customerPN (customerID, phoneNumber) VALUES
    (1, '1234567890'),
    (2, '2345678901'),
    (3, '3456789012'),
    (4, '4567890123'),
    (5, '5678901234'),
    (6, '6789012345'),
    (7, '7890123456'),
    (8, '8901234567'),
    (9, '9012345678'),
    (10, '1234567890'),
    (11, '2345678901'),
    (12, '3456789012'),
    (13, '4567890123'),
    (14, '5678901234'),
    (15, '6789012345'),
    (16, '7890123456'),
    (17, '8901234567'),
    (18, '9012345678'),
    (19, '1234567890'),
    (20, '2345678901');
    
-- Bổ sung dữ liệu vào bảng DonHangCaNhan
INSERT INTO DonHangCaNhan (MaDonHang, MaKhachHang, Sothe) VALUES
    ('1', '01', '1'),
    ('2', '02', '2'),
    ('3', '03', '3'),
    ('4', '04', '4'),
    ('5', '05', '5'),
    ('6', '06', '6'),
    ('7', '07', '7'),
    ('8', '08', '8'),
    ('9', '09', '9'),
    ('10', '10', '10'),
    ('11', '11', '11'),
    ('12', '12', '12'),
    ('13', '13', '13'),
    ('14', '14', '14'),
    ('15', '15', '15'),
    ('16', '16', '16'),
    ('17', '17', '17'),
    ('18', '18', '18'),
    ('19', '19', '19'),
    ('20', '20', '20');

INSERT INTO VOUCHER_TYPE (discount_percent,note,max_discount)
VALUES
	('20',null,100000),
	('10',null,100000),
    ('5',null,100000),
	('30',null,100000),
    ('20',null,100000),
	('10',null,100000),
    (10, 'Discount for Category A', 10000),
    (15, 'Special Discount', 20000),
    (20, 'Holiday Promotion', 30000),
    (25, 'New Year Sale', 40000),
    (30, 'Customer Loyalty', 50000),
    (12, 'Weekend Special', 15000),
    (18, 'Limited Time Offer', 25000),
    (22, 'Seasonal Discount', 35000),
    (28, 'Mid-Year Clearance', 45000),
    (32, 'Flash Sale', 55000),
    (10, 'Category A', 10000),
    (15, 'Special', 20000),
    (20, 'Holiday', 30000),
    (25, 'New Year', 40000),
    (30, 'Loyalty', 50000),
    (12, 'Weekend', 15000),
    (18, 'Limited Time', 25000),
    (22, 'Seasonal', 35000),
    (28, 'Mid-Year', 45000);
   
    
INSERT INTO VOUCHER_CARD (id, STT, current_status) VALUES
    (1, 1, 1),
    (1, 2, 1),
    (2, 1, 1),
    (2, 2, 1),
    (3, 1, 1),
    (3, 2, 1),
    (4, 1, 1),
    (4, 2, 1),
    (5, 1, 1),
    (5, 2, 1),
    (6, 1, 1),
    (6, 2, 1),
    (7, 1, 1),
    (7, 2, 1),
    (8, 1, 1),
    (8, 2, 1),
    (9, 1, 1),
    (9, 2, 1),
    (10, 1, 1),
    (10, 2, 1);
    
INSERT INTO VOUCHER_EFFECTIVE_TIME(id,start_time,end_time)
VALUES
	('1','2023-09-30', '2023-12-30' ) ,
    ('2','2023-01-01','2023-12-30'),
	('3','2023-09-30', '2023-12-30' ) ,
    ('4','2023-01-01','2023-12-30'),
    ('5','2023-09-30', '2023-12-30' ) ,
    ('6','2023-01-01','2023-12-30'),
    ('7', '2023-01-01', '2023-02-01'),
    ('8', '2023-03-01', '2023-04-01'),
    ('9', '2023-02-15', '2023-03-15'),
    ('10', '2023-04-15', '2023-05-15'),
    ('11', '2023-03-01', '2023-04-01'),
    ('12', '2023-05-01', '2023-06-01'),
    ('13', '2023-04-15', '2023-05-15'),
    ('14', '2023-06-15', '2023-07-15'),
    ('15', '2023-05-01', '2023-06-01'),
    ('16', '2023-07-01', '2023-08-01'),
    ('17', '2023-06-15', '2023-07-15'),
    ('18', '2023-08-15', '2023-09-15'),
    ('19', '2023-07-01', '2023-08-01'),
    ('20', '2023-09-01', '2023-10-01'),
    ('21', '2023-08-15', '2023-09-15'),
    ('22', '2023-10-15', '2023-11-15'),
    ('23', '2023-09-01', '2023-10-01'),
    ('24', '2023-11-01', '2023-12-01'),
    ('25', '2023-10-15', '2023-11-15');
  

INSERT INTO bookingTables(seats)
VALUES
	('10'),
	('10'),
	('10'),
    ('10'),
	('10'),
    ('10'),
	('10'),
	('10'),
    ('10'),
	('10'),
	('20'),
    ('20'),
	('20'),
	('20'),
    ('20'),
	('30'),
	('30'),
    ('30'),
	('30'),
    ('30');
    
INSERT INTO bookingInfo (fk_tableID, fk_customerID, orderDate, orderTime, startDate, startTime, endTime) VALUES
    (1, 1, '2023-01-01', '12:00:00', '2023-01-01', '12:00:00', '14:00:00'),
    (2, 2, '2023-02-01', '18:00:00', '2023-02-01', '18:00:00', '20:00:00'),
    (3, 3, '2023-03-01', '14:00:00', '2023-03-01', '14:00:00', '16:00:00'),
    (4, 4, '2023-04-01', '20:00:00', '2023-04-01', '20:00:00', '22:00:00'),
    (5, 5, '2023-05-01', '13:00:00', '2023-05-01', '13:00:00', '15:00:00'),
    (6, 6, '2023-06-01', '19:00:00', '2023-06-01', '19:00:00', '21:00:00'),
    (7, 7, '2023-07-01', '15:00:00', '2023-07-01', '15:00:00', '17:00:00'),
    (8, 8, '2023-08-01', '21:00:00', '2023-08-01', '21:00:00', '23:00:00'),
    (9, 9, '2023-09-01', '11:00:00', '2023-09-01', '11:00:00', '13:00:00'),
    (10, 10, '2023-10-01', '17:00:00', '2023-10-01', '17:00:00', '19:00:00'),
    (11, 11, '2023-11-01', '16:00:00', '2023-11-01', '16:00:00', '18:00:00'),
    (12, 12, '2023-12-01', '22:00:00', '2023-12-01', '22:00:00', '24:00:00'),
    (13, 13, '2024-01-01', '12:00:00', '2024-01-01', '12:00:00', '14:00:00'),
    (14, 14, '2024-02-01', '18:00:00', '2024-02-01', '18:00:00', '20:00:00'),
    (15, 15, '2024-03-01', '14:00:00', '2024-03-01', '14:00:00', '16:00:00'),
    (16, 16, '2024-04-01', '20:00:00', '2024-04-01', '20:00:00', '22:00:00'),
    (17, 17, '2024-05-01', '13:00:00', '2024-05-01', '13:00:00', '15:00:00'),
    (18, 18, '2024-06-01', '19:00:00', '2024-06-01', '19:00:00', '21:00:00'),
    (19, 19, '2024-07-01', '15:00:00', '2024-07-01', '15:00:00', '17:00:00'),
    (20, 20, '2024-08-01', '21:00:00', '2024-08-01', '21:00:00', '23:00:00');
    
-- Bổ sung dữ liệu vào bảng DonDatTruoc
INSERT INTO DonDatTruoc (MaDonHang, MaBan) VALUES
    ('1', '1'),
    ('2', '2'),
    ('3', '3'),
    ('4', '4'),
    ('5', '5'),
    ('6', '6'),
    ('7', '7'),
    ('8', '8'),
    ('9', '9'),
    ('10', '10'),
    ('11', '11'),
    ('12', '12'),
    ('13', '13'),
    ('14', '14'),
    ('15', '15'),
    ('16', '16'),
    ('17', '17'),
    ('18', '18'),
    ('19', '19'),
    ('20', '20');

INSERT INTO LoaiMon (mota,ten,giobatdau,gioketthuc,loaimon)
VALUES
	(NULL,'Pudding','7:00:00','22:00:00','Do an'),
	(NULL,'Tart','7:00:00','22:00:00','Do an'),
	(NULL,'Tart trứng','7:00:00','22:00:00','Do an'),
	(NULL,'Tiramisu classic','7:00:00','22:00:00','Do an'),
	(NULL,'Tiramisu matcha','7:00:00','22:00:00','Do an'),
    (NULL,'Trà sữa TCĐĐ','7:00:00','22:00:00','Do uong'),
	(NULL,'Trà sữa matcha ','7:00:00','22:00:00','Do uong'),
	(NULL,'Hồng trà','7:00:00','22:00:00','Do uong'),
	(NULL,'Bạc xỉu','7:00:00','22:00:00','Do uong'),
	(NULL,'Cà phê phin đá','7:00:00','22:00:00','Do uong'),
    (NULL, 'Bánh mì pate', '7:00:00', '22:00:00', 'Do an'),
    (NULL, 'Bún riêu', '7:00:00', '22:00:00', 'Do an'),
    (NULL, 'Gỏi cuốn', '7:00:00', '22:00:00', 'Do an'),
    (NULL, 'Nước mía', '7:00:00', '22:00:00', 'Do uong'),
    (NULL, 'Nước lọc', '7:00:00', '22:00:00', 'Do uong'),
    (NULL, 'Mì xào', '7:00:00', '22:00:00', 'Do an'),
    (NULL, 'Cơm rang', '7:00:00', '22:00:00', 'Do an'),
    (NULL, 'Trà đào', '7:00:00', '22:00:00', 'Do uong'),
    (NULL, 'Nước chanh', '7:00:00', '22:00:00', 'Do uong'),
    (NULL, 'Bún chả cá', '7:00:00', '22:00:00', 'Do an'),
    (NULL, 'Bún bò Huế', '7:00:00', '22:00:00', 'Do an'),
    (NULL, 'Trà sen', '7:00:00', '22:00:00', 'Do uong'),
    (NULL, 'Sinh tố bơ', '7:00:00', '22:00:00', 'Do uong'),
    (NULL, 'Bánh flan', '7:00:00', '22:00:00', 'Do an'),
    (NULL, 'Bánh tráng trộn', '7:00:00', '22:00:00', 'Do an');

    

insert into mon (Maloaimon, kichco, dongia)
values
	('1','M','30000'),
    ('2','M','30000'),
    ('3','M','30000'),
    ('4','M','30000'),
    ('5', 'M', '25000'),
    ('6', 'M', '30000'),
    ('7', 'M', '28000'),
    ('8', 'M', '15000'),
    ('9', 'M', '12000'),
    ('10', 'M', '35000'),
    ('11', 'M', '32000'),
    ('12', 'M', '18000'),
    ('13', 'M', '10000'),
    ('14', 'M', '27000'),
    ('15', 'M', '23000'),
    ('16', 'M', '20000'),
    ('17', 'M', '22000'),
    ('18', 'M', '28000'),
    ('19', 'M', '19000'),
    ('20', 'M', '16000');
    
-- Bổ sung dữ liệu vào bảng ThuocveMon
INSERT INTO thuocvemon (Mamon, Madonhang, Kichco, Giatheongay, Soluong) VALUES
    ('1', '1', 'M', '30000', '2'),
    ('2', '1', 'M', '30000', '3'),
    ('3', '1', 'M', '30000', '1'),
    ('4', '1', 'M', '30000', '4'),
    ('5', '2', 'M', '25000', '2'),
    ('6', '2', 'M', '30000', '3'),
    ('7', '2', 'M', '28000', '1'),
    ('8', '2', 'M', '15000', '4'),
    ('9', '3', 'M', '12000', '2'),
    ('10', '3', 'M', '35000', '3'),
    ('11', '3', 'M', '32000', '1'),
    ('12', '4', 'M', '18000', '4'),
    ('13', '4', 'M', '10000', '2'),
    ('14', '5', 'M', '27000', '3'),
    ('15', '5', 'M', '23000', '1'),
    ('16', '6', 'M', '20000', '4'),
    ('17', '6', 'M', '22000', '2'),
    ('18', '7', 'M', '28000', '3'),
    ('19', '8', 'M', '19000', '1'),
    ('20', '8', 'M', '16000', '4');
-- thêm lệnh sau vào file insert dữ liệu mẫu trước khi thực hiện 
-- thủ tục applyVoucherForOrder cho áp dụng thanh toán voucher
-- INSERT INTO thuocvemon (Mamon, Madonhang, Kichco, Giatheongay, Soluong) VALUES
--    ('10', '1', 'M', '100000', '50'),
--    ('16', '2', 'M', '100000', '20');
insert into dieukienapdung (Mavoucher, Maloaimon, Kichco, minNum)
values
    ('1', '1', 'M', '1'),
    ('2', '2', 'M', '1'),
    ('2', '3', 'M', '1'),
    ('3', '3', 'M', '1'),
    ('1', '4', 'M', '1'),
    ('4', '5', 'M', '1'),
    ('1', '6', 'M', '1'),
    ('2', '1', 'M', '2'),
    ('3', '20', 'M', '2'),
    ('3', '8', 'M', '2'),
    ('4', '4', 'M', '2'),
    ('10', '5', 'M', '2'),
    ('4', '6', 'M', '2'),
    ('1', '10', 'M', '3'),
    ('2', '20', 'M', '3'),
    ('2', '17', 'M', '3'),
    ('3', '4', 'M', '3'),
    ('1', '5', 'M', '3'),
    ('14', '16', 'M', '3');
    

call applyVoucherForOrder(1, 1, 1);
call applyVoucherForOrder(2, 1, 2);
call applyVoucherForOrder(3, 2, 1);
call applyVoucherForOrder(4, 2, 2);
call applyVoucherForOrder(5, 3, 1);
call applyVoucherForOrder(6, 3, 2);
call applyVoucherForOrder(7, 4, 1);
call applyVoucherForOrder(8, 4, 2);
call applyVoucherForOrder(9, 5, 1);
call applyVoucherForOrder(10, 5, 2);
call applyVoucherForOrder (11, 6, 1);
call applyVoucherForOrder(12, 6, 2);
call applyVoucherForOrder(13, 7, 1);
call applyVoucherForOrder (14, 7, 2);
call applyVoucherForOrder(15, 8, 1);
call applyVoucherForOrder(16, 8, 2);
call applyVoucherForOrder(17, 9, 1);
call applyVoucherForOrder(18, 9, 2);
call applyVoucherForOrder(19, 10, 1);
call applyVoucherForOrder(20, 10, 2);

-- Bổ sung dữ liệu vào bảng Xuat
INSERT INTO Xuat (MaNV, MaHD, MaDH, NgayXuat, GioXuat) VALUES
    ('01', '1', '1', '2023-12-01', '08:30:00'),
    ('02', '2', '2', '2023-12-01', '09:45:00'),
    ('03', '3', '3', '2023-12-02', '10:15:00'),
    ('04', '4', '4', '2023-12-02', '12:30:00'),
    ('05', '5', '5', '2023-12-03', '13:45:00'),
    ('06', '6', '6', '2023-12-03', '15:00:00'),
    ('07', '7', '7', '2023-12-04', '16:30:00'),
    ('08', '8', '8', '2023-12-04', '18:45:00'),
    ('09', '9', '9', '2023-12-05', '19:15:00'),
    ('10', '10', '10', '2023-12-05', '21:30:00'),
    ('11', '11', '11', '2023-12-06', '22:45:00'),
    ('12', '12', '12', '2023-12-06', '08:30:00'),
    ('13', '13', '13', '2023-12-07', '09:45:00'),
    ('14', '14', '14', '2023-12-07', '11:15:00'),
    ('15', '15', '15', '2023-12-08', '12:30:00'),
    ('16', '16', '16', '2023-12-08', '13:45:00'),
    ('17', '17', '17', '2023-12-09', '15:00:00'),
    ('18', '18', '18', '2023-12-09', '16:30:00'),
    ('19', '19', '19', '2023-12-10', '18:45:00'),
    ('1', '20', '20', '2023-12-10', '19:15:00');

