package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.*;
import com.evrental.evrentalsystem.enums.*;
import com.evrental.evrentalsystem.enums.Enum;
import com.evrental.evrentalsystem.repository.*;
import com.evrental.evrentalsystem.response.staff.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

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
    private final EmployeeDetailRepository employeeDetailRepository;
    private final InspectionRepository inspectionRepository;
    private final AdditionalFeeRepository additionalFeeRepository;
    private final ContractRepository contractRepository;
    private final RenterDetailRepository renterDetailRepository;
    private final InspectionAfterRepository inspectionAfterRepository;
    private final ReportRepository reportRepository;
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

                    // --- Tính toán các giá trị ---
                    int rentingDurationDay = countRentingDay(booking.getStartTime(), booking.getExpectedReturnTime());
                    double discountRate = booking.getPromotion() == null
                            ? 1.0
                            : (100 - booking.getPromotion().getDiscountPercent()) / 100.0;

                    int fee = (int) Math.round(rentingDurationDay * booking.getVehicleModel().getPrice() * discountRate) * 1000;
                    List<AdditionalFee> afs = additionalFeeRepository.findAllByBooking(booking);
                    long additionalFee = afs.stream()
                            .filter(af -> af.getAmount() != null)
                            .mapToLong(af -> af.getAmount().longValue()) // dùng long thay vì int
                            .sum(); // nhân với 1000L để giữ kiểu long



                    // --- In ra console để debug ---
                    System.out.println("============== DEBUG BOOKING ==============");
                    System.out.println("Booking ID: " + booking.getBookingId());
                    System.out.println("Customer: " + (booking.getRenter() != null ? booking.getRenter().getFullName() : "Unknown"));
                    System.out.println("Phone: " + (booking.getRenter() != null ? booking.getRenter().getPhone() : "Unknown"));
                    System.out.println("Vehicle Model ID: " + booking.getVehicleModel().getVehicleId());
                    System.out.println("Vehicle Model: " + (booking.getVehicleModel() != null ? booking.getVehicleModel().getModel() : "Unknown"));
                    System.out.println("Start Time: " + booking.getStartTime());
                    System.out.println("Expected Return Time: " + booking.getExpectedReturnTime());
                    System.out.println("Renting Duration (days): " + rentingDurationDay);
                    System.out.println("Promotion: " + (booking.getPromotion() != null ? booking.getPromotion().getDiscountPercent() + "%" : "None"));
                    System.out.println("Discount Rate: " + discountRate);
                    System.out.println("Vehicle Price per day: " + booking.getVehicleModel().getPrice());
                    System.out.println("Base Fee (before additional): " + fee);
                    System.out.println("Additional Fees count: " + afs.size());
                    afs.forEach(af -> System.out.println(" - Additional Fee: " + af.getFeeName() + " | Amount: " + af.getAmount()));
                    System.out.println("Total Additional Fee: " + additionalFee);
                    System.out.println("Total Amount (fee + additional): " + (fee + additionalFee));
                    System.out.println("Status: " + booking.getStatus());
                    System.out.println("===========================================\n");

                    // --- Gán giá trị cho response ---
                    response.id = booking.getBookingId();
                    response.customerName = booking.getRenter() != null ? booking.getRenter().getFullName() : "Unknown";
                    response.customerNumber = booking.getRenter() != null ? booking.getRenter().getPhone() : "Unknown";
                    response.vehicleModelId = booking.getVehicleModel().getVehicleId();
                    response.vehicleModel = booking.getVehicleModel() != null ? booking.getVehicleModel().getModel() : "Unknown";
                    response.startDate = booking.getStartTime();
                    response.endDate = booking.getExpectedReturnTime();
                    response.totalAmount = fee + additionalFee;
                    response.status = booking.getStatus();

                    return response;
                })
                .collect(Collectors.toList());
        // Thu thập các đối tượng vào danh sách
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
            long minutes = Duration.between(booking.getStartTime(), booking.getExpectedReturnTime()).toMinutes();
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
            long minutes = Duration.between(booking.getExpectedReturnTime(), booking.getActualReturnTime()).toMinutes();
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
                    double cost = (Integer.parseInt(i.getDescription()) - amount) * batteryCapacity * Enum.Cost_per_kWh.getValue() / 100;
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

    public List<InspectionDetailsByBookingResponse> getInspectionAfterDetailsByBookingId(int id){
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        List<InspectionAfter> inspections = inspectionAfterRepository.findAllByBooking(booking);
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

    public boolean createInspectionAfter(
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


            InspectionAfter inspection = new InspectionAfter();
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
            inspectionAfterRepository.save(inspection);
            return true;
        } catch (Exception e) {
            log.error("Lỗi khi tạo inspection: {}", e.getMessage(), e);
            return false;
        }
    }

    public void createReport(Integer staffId,
                             Integer vehicleDetailId,
                             String description){
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found with ID: " + staffId));
        EmployeeDetail staffDetail = employeeDetailRepository.findByEmployee(staff)
                .orElseThrow(() -> new RuntimeException("Staff detail not found with ID: " + staffId));
        User admin = userRepository.findAdminByStationId(staffDetail.getStation().getStationId())
                .orElseThrow(() -> new RuntimeException("Admin not found in this station"));
        VehicleDetail vd = vehicleDetailRepository.findById(vehicleDetailId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + vehicleDetailId));
        Report r = new Report();
        r.setStaff(staff);
        r.setAdmin(admin);
        r.setDescription(description);
        r.setVehicleDetail(vd);
        r.setCreatedAt(LocalDateTime.now());
        r.setStatus(ReportStatusEnum.PENDING.toString());
        reportRepository.save(r);
    }
}

