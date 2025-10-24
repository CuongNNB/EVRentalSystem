package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.*;
import com.evrental.evrentalsystem.enums.*;
import com.evrental.evrentalsystem.enums.Enum;
import com.evrental.evrentalsystem.repository.*;
import com.evrental.evrentalsystem.response.staff.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaffService {

    private final BookingRepository bookingRepository;
    private final VehicleDetailRepository vehicleDetailRepository;
    private final UserRepository userRepository;
    private final InspectionRepository inspectionRepository;
    private final AdditionalFeeRepository additionalFeeRepository;
    private final ContractRepository contractRepository;
    private final RenterDetailRepository renterDetailRepository;
    private final MailService mailService;
    private String encodeToBase64(MultipartFile file) {
        try {
            if (file != null && !file.isEmpty()) {
                byte[] bytes = file.getBytes();
                log.info("Encode file {} size {}", file.getOriginalFilename(), bytes.length);
                return Base64.getEncoder().encodeToString(bytes);
            } else {
                throw new RuntimeException("File upload bị trống!");
            }
        } catch (IOException e) {
            throw new RuntimeException("Không thể đọc file: " + file.getOriginalFilename(), e);
        }
    }

    public List<BookingsInStationResponse> bookingsInStation(Integer stationId) {
        // Tìm danh sách booking theo stationId
        List<Booking> bookings = bookingRepository.findByStation_StationId(stationId);

        // Chuyển đổi List<Booking> thành List<BookingsInStationResponse>
        return bookings.stream()
                .map(booking -> {
                    // Tạo đối tượng BookingsInStationResponse từ đối tượng Booking
                    BookingsInStationResponse response = new BookingsInStationResponse();

                    int rentingDurationDay = countRentingDay(booking.getStartTime(),booking.getExpectedReturnTime());
                    double discountRate = booking.getPromotion() == null
                            ? 1.0
                            : (100 - booking.getPromotion().getDiscountPercent()) / 100.0;

                    int fee = (int) Math.round(rentingDurationDay * booking.getVehicleModel().getPrice() * discountRate) *1000;
                    List<AdditionalFee> afs = additionalFeeRepository.findAllByBooking(booking) ;
                    int additionalFee = afs.stream()
                            .filter(af -> af.getAmount() != null)
                            .mapToInt(af -> af.getAmount().intValue())
                            .sum() * 1000;

                    // Gán các giá trị cho response từ booking
                    response.id = booking.getBookingId();
                    response.customerName = booking.getRenter() != null ? booking.getRenter().getFullName() : "Unknown";
                    response.customerNumber = booking.getRenter() != null ? booking.getRenter().getPhone() : "Unknown"; // Giả sử có trường phoneNumber trong User
                    response.vehicleModelId = booking.getVehicleModel().getVehicleId();
                    response.vehicleModel = booking.getVehicleModel() != null ? booking.getVehicleModel().getModel() : "Unknown"; // Giả sử có trường modelName trong VehicleModel
                    response.startDate = booking.getStartTime();
                    response.endDate = booking.getExpectedReturnTime();
                    response.totalAmount = fee+additionalFee;
                    response.status = booking.getStatus();
                    return response;
                })
                .collect(Collectors.toList()); // Thu thập các đối tượng vào danh sách
    }

    public boolean changeStatus(int id, String status) {
        try {
            int updated = bookingRepository.updateBookingStatus(id, status);
            if (updated > 0) {
                log.info("✅ Update success! (Booking ID: {})", id);
                return true;
            } else {
                log.warn("⚠️ No booking found with ID: {}", id);
                return false;
            }
        } catch (Exception e) {
            log.error("❌ Error updating booking status for ID: {}", id, e);
            throw e; // ném lỗi lên controller
        }
    }

    public List<VehicleIdAndLicensePlateResponse> getAllAvailableVehiclesInStationAndModel(int modelId, int stationId){
        List<VehicleDetail> vehicles = vehicleDetailRepository.findAllByVehicleModel_VehicleIdAndStation_StationIdAndStatus(modelId,stationId,"AVAILABLE");
        return vehicles.stream()
                .map(vehicle -> new VehicleIdAndLicensePlateResponse(
                        vehicle.getId(),
                        vehicle.getLicensePlate()
                ))
                .collect(Collectors.toList());
    }



    public VehicleDetailsResponse getVehicleDetailById(int id) {
        VehicleDetailsResponse response = new VehicleDetailsResponse();
        VehicleDetail vehicleDetail = vehicleDetailRepository.findById(id).orElse(null);
        if(vehicleDetail != null) {
            response.setId(vehicleDetail.getId());
            response.setModelName(vehicleDetail.getVehicleModel().getModel());
            response.setLicensePlate(vehicleDetail.getLicensePlate());
            response.setColor(vehicleDetail.getColor());
            response.setBattery(vehicleDetail.getBatteryCapacity());
            response.setOdo(vehicleDetail.getOdo());
            response.setImage(vehicleDetail.getPicture());
        }
        return response;
    }

    public boolean changeVehicleStatus(Integer vehicleId, String newStatus) {
        int updated = vehicleDetailRepository.updateVehicleStatusById(vehicleId, newStatus);
        return updated > 0;
    }


    public boolean createInspection(
            Integer bookingId,
            PartCarName partName,
            MultipartFile picture,
            String description,
            Integer staffId,
            String status
    ) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking ID không tồn tại: " + bookingId));

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff ID không tồn tại: " + staffId));
        try {


            Inspection inspection = new Inspection();
            inspection.setBooking(booking);

            // ✅ Lưu tên phần xe bằng enum
            inspection.setPartName(partName.name()); // hoặc .toString(), cả hai đều OK

            String base64Picture = encodeToBase64(picture);
            log.info("Base64 picture length: {}", base64Picture.length());
            inspection.setPicture(base64Picture);
            inspection.setDescription(description);
            inspection.setStaff(staff);
            inspection.setStatus(status);
            inspection.setInspectedAt(LocalDateTime.now());
            inspectionRepository.save(inspection);
            return true;
        } catch (Exception e) {
            log.error("Lỗi khi tạo inspection: {}", e.getMessage(), e);
            return false;
        }
    }

    public boolean createAdditionalFee(
            Integer bookingId,
            AdditionalFeeEnum feeName,
            int amount,
            String desc
    ) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking ID không tồn tại: " + bookingId));
        if(feeName == AdditionalFeeEnum.Late_Return_Fee){
            long minutes = Duration.between(booking.getExpectedReturnTime(), booking.getActualReturnTime()).toMinutes();
            int rentingHours = (int) Math.ceil(minutes / 60.0);
            double pricePerHour =  booking.getVehicleModel().getPrice()*1000/24;
            if(minutes >= 0){
                try {
                    AdditionalFee af = new AdditionalFee();
                    af.setBooking(booking);
                    af.setFeeName(feeName.name()); // hoặc .toString(), cả hai đều OK
                    double cost = rentingHours * pricePerHour;
                    af.setAmount(cost);
                    af.setDescription(desc);
                    additionalFeeRepository.save(af);
                    return true;
                } catch (Exception e) {
                    log.error("Lỗi khi tạo additional fee: {}", e.getMessage(), e);
                    return false;
                }
            }else{
                return false;
            }

        }
        if(feeName == AdditionalFeeEnum.Over_Mileage_Fee){
            Inspection i = inspectionRepository.findByBookingAndPartName(booking,PartCarName.Odometer.toString());
            int odoBefore =  Integer.parseInt(i.getDescription().replaceAll("[^0-9]", "")) ;
            int odoAfter = amount;
            long minutes = Duration.between(booking.getStartTime(), booking.getExpectedReturnTime()).toMinutes();
            int rentingHours = (int) Math.ceil(minutes / 60.0);
            int totalAllowedOdo = odoBefore + Enum.Allowed_distance_per_hour.getValue() * rentingHours;
            double pricePerHour =  booking.getVehicleModel().getPrice()*1000/24;
            if(totalAllowedOdo < odoAfter){
                try {
                    AdditionalFee af = new AdditionalFee();
                    af.setBooking(booking);
                    af.setFeeName(feeName.name()); // hoặc .toString(), cả hai đều OK
                    double cost = (odoAfter - totalAllowedOdo) * (pricePerHour/Enum.Allowed_distance_per_hour.getValue());
                    af.setAmount(cost);
                    af.setDescription(desc);
                    additionalFeeRepository.save(af);
                    booking.getVehicleDetail().setOdo(odoAfter);
                    bookingRepository.save(booking);
                    return true;
                } catch (Exception e) {
                    log.error("Lỗi khi tạo additional fee: {}", e.getMessage(), e);
                    return false;
                }
            }else{
                return false;
            }
        }
        if(feeName == AdditionalFeeEnum.Fuel_Fee){
            Inspection i = inspectionRepository.findByBookingAndPartName(booking,PartCarName.Battery.toString());
            if(amount < Integer.parseInt(i.getDescription())){
                try {
                    AdditionalFee af = new AdditionalFee();
                    af.setBooking(booking);
                    af.setFeeName(feeName.name());
                    int batteryCapacity = Integer.parseInt(booking.getVehicleDetail().getBatteryCapacity().replaceAll("[^0-9]", "")) ;
                    double cost = (Integer.parseInt(i.getDescription()) - amount) * batteryCapacity * Enum.Cost_per_kWh.getValue();
                    af.setAmount(cost);
                    af.setDescription(desc);
                    additionalFeeRepository.save(af);
                    return true;
                } catch (Exception e) {
                    log.error("Lỗi khi tạo additional fee: {}", e.getMessage(), e);
                    return false;
                }
            }else{
                return false;
            }
        }
        try {
            AdditionalFee af = new AdditionalFee();
            af.setBooking(booking);
            af.setFeeName(feeName.name()); // hoặc .toString(), cả hai đều OK
            af.setAmount((double) amount);
            af.setDescription(desc);
            additionalFeeRepository.save(af);
            return true;
        } catch (Exception e) {
            log.error("Lỗi khi tạo additional fee: {}", e.getMessage(), e);
            return false;
        }
    }

    public RenterDetailsByBookingResponse getRenterDetailsByBooking(int bookingId){
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking ID không tồn tại: " + bookingId));
        RenterDetailsByBookingResponse response = new RenterDetailsByBookingResponse();
        response.setGplx(booking.getRenter().getRenterDetail().getDriverLicense());
        response.setEmail(booking.getRenter().getEmail());
        response.setBackCccd(booking.getRenter().getRenterDetail().getCccdBack());
        response.setFrontCccd(booking.getRenter().getRenterDetail().getCccdFront());
        response.setFullName(booking.getRenter().getFullName());
        response.setPhoneNumber(booking.getRenter().getPhone());
        return response;
    }

    public BookingDetailsByBookingResponse getBookingDetailsByBooking(int bookingId){
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking ID không tồn tại: " + bookingId));
        int rentingDurationDay = countRentingDay(booking.getStartTime(),booking.getExpectedReturnTime());

        double discountRate = booking.getPromotion() == null
                ? 1.0
                : (100 - booking.getPromotion().getDiscountPercent()) / 100.0;

        int fee = (int) Math.round(rentingDurationDay * booking.getVehicleModel().getPrice() * discountRate) * 1000;

        List<AdditionalFee> afs = additionalFeeRepository.findAllByBooking(booking);
        int additionalFee = afs.stream()
                .filter(af -> af.getAmount() != null)
                .mapToInt(af -> af.getAmount().intValue())
                .sum();


        BookingDetailsByBookingResponse response = new BookingDetailsByBookingResponse();
        response.setBookingId(bookingId);
        response.setFee(fee);
        response.setDeposit(((int) Math.round(booking.getDeposit())));
        response.setStationName(booking.getStation().getStationName());
        response.setTotalAmount(fee+additionalFee);
        response.setEndDate(booking.getExpectedReturnTime());
        response.setAdditionalFee(additionalFee);
        response.setStartDate(booking.getStartTime());
        response.setLicensePlate(booking.getVehicleDetail().getLicensePlate());
        response.setModelName(booking.getVehicleModel().getModel());
        response.setStatus(BookingStatus.valueOf(booking.getStatus()));
        response.setRentingDurationDay(rentingDurationDay);
        return response;
    }

    public int countRentingDay(LocalDateTime start, LocalDateTime end) {
        int days = (int) ChronoUnit.DAYS.between(start.toLocalDate(), end.toLocalDate());
        return Math.max(1,days);
    }

    public void createContractByBookingId(int id, int staffId){
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found with ID: " + staffId));
        Contract c = new Contract();
        c.setBooking(booking);
        c.setStatus(ContractStatusEnum.PENDING.name());
        c.setStaffManager(staff);
        contractRepository.save(c);

        String renterEmail = booking.getRenter().getEmail();
        mailService.sendContractCreatedMail(renterEmail);
    }

    public void verifyRenterDetailStatusByBookingId(int id){
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        RenterDetail rd = new RenterDetail();
        rd = booking.getRenter().getRenterDetail();
        rd.setVerificationStatus(RenterDetailVerificationStatusEnum.VERIFIED.name());
        renterDetailRepository.save(rd);
    }

    public RenterDetailVerificationStatusEnum getVerificationStatusByBookingId(int id){
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        String status = booking.getRenter().getRenterDetail().getVerificationStatus();
        return RenterDetailVerificationStatusEnum.valueOf(status);
    }

    public VehicleDetailsByBookingResponse getVehicleDetailsByBookingId(int id){
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        VehicleDetailsByBookingResponse response = new VehicleDetailsByBookingResponse();
        response.setLicensePlate(booking.getVehicleDetail().getLicensePlate());
        response.setOdo(booking.getVehicleDetail().getOdo());
        response.setColor(booking.getVehicleDetail().getColor());
        response.setBatteryCapacity(booking.getVehicleDetail().getBatteryCapacity());
        return response;
    }

    public List<InspectionDetailsByBookingResponse> getInspectionDetailsByBookingId(int id){
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        List<Inspection> inspections = inspectionRepository.findAllByBooking(booking);
        return inspections.stream()
                .map(inspection -> {
                    InspectionDetailsByBookingResponse response = new InspectionDetailsByBookingResponse();
                    response.setPartName(PartCarName.valueOf(inspection.getPartName()));
                    response.setPic(inspection.getPicture());
                    response.setDesc(inspection.getDescription());
                    return response;
                })
                .collect(Collectors.toList());
    }

    public void UpdateLicensePlateForBooking(int bookingId, String licensePlate){
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        VehicleDetail vd = vehicleDetailRepository.findByLicensePlate(licensePlate);
        booking.setVehicleDetail(vd);
        bookingRepository.save(booking);
    }

    public void updateActualReturnTimeOfBooking(int bookingId){
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        booking.setActualReturnTime(LocalDateTime.now());
        bookingRepository.save(booking);
    }

    public void updateStatusOfVehicleToAvailableByBookingId(int bookingId){
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        VehicleDetail vd = vehicleDetailRepository.findByLicensePlate(booking.getVehicleDetail().getLicensePlate());
        vd.setStatus(VehicleStatus.AVAILABLE.name());
    }
}

