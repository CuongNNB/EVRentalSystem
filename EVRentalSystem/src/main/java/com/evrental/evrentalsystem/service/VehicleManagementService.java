package com.evrental.evrentalsystem.service;

import com.evrental.evrentalsystem.entity.Station;
import com.evrental.evrentalsystem.entity.VehicleDetail;
import com.evrental.evrentalsystem.entity.VehicleModel;
import com.evrental.evrentalsystem.enums.VehicleStatus;
import com.evrental.evrentalsystem.repository.StationRepository;
import com.evrental.evrentalsystem.repository.VehicleDetailRepository;
import com.evrental.evrentalsystem.repository.VehicleModelRepository;
import com.evrental.evrentalsystem.request.AdminCreateVehicleDetailRequest;
import com.evrental.evrentalsystem.request.AdminCreateVehicleModelRequest;
import com.evrental.evrentalsystem.request.AdminUpdateVehicleDetailRequest;
import com.evrental.evrentalsystem.request.AdminUpdateVehicleModelRequest;
import com.evrental.evrentalsystem.response.admin.*;
import com.evrental.evrentalsystem.util.ImageUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleManagementService {

    private final VehicleModelRepository vehicleModelRepository;
    private final VehicleDetailRepository vehicleDetailRepository;
    private final StationRepository stationRepository;
    ImageUtil imageUtil = new ImageUtil();

    // <editor-fold desc="This is the section for vehicle detail management">
    public List<AdminVehicleModelResponse> getAllVehiclesGroupedByModel() {
        List<VehicleModel> models = vehicleModelRepository.findAllWithDetailsAndStation();

        // Vì JOIN FETCH trên collection có thể lặp parent, ta group theo vehicleId
        Map<Integer, AdminVehicleModelResponse> map = new LinkedHashMap<>();

        for (VehicleModel vm : models) {
            Integer vid = vm.getVehicleId();
            AdminVehicleModelResponse vmResp = map.computeIfAbsent(vid, id -> AdminVehicleModelResponse.builder()
                    .vehicleId(vm.getVehicleId())
                    .brand(vm.getBrand())
                    .model(vm.getModel())
                    .price(vm.getPrice())
                    .seats(vm.getSeats())
                    .modelPicture(vm.getPicture())
                    .vehicleDetails(new ArrayList<>())
                    .build()
            );

            List<VehicleDetail> details = vm.getVehicleDetails();
            if (details == null) continue;

            for (VehicleDetail vd : details) {
                // map detail -> DTO
                AdminVehicleDetailResponse dResp = AdminVehicleDetailResponse.builder()
                        .id(vd.getId())
                        .licensePlate(vd.getLicensePlate())
                        .batteryCapacity(vd.getBatteryCapacity())
                        .odo(vd.getOdo())
                        .detailPicture(vd.getPicture())
                        .status(vd.getStatus().toString())
                        .color(vd.getColor())
                        .build();

                Station st = vd.getStation();
                if (st != null) {
                    dResp.setStationId(st.getStationId());
                    dResp.setStationName(st.getStationName());
                }

                vmResp.getVehicleDetails().add(dResp);
            }
        }

        return new ArrayList<>(map.values());
    }

    public String updateVehicleDetailStatus(Integer vehicleDetailId, String newStatus) {
        VehicleDetail vehicleDetail = vehicleDetailRepository.findById(vehicleDetailId)
                .orElseThrow(() -> new RuntimeException("Vehicle detail not found with id: " + vehicleDetailId));
        VehicleStatus current = vehicleDetail.getStatus();
        VehicleStatus target = VehicleStatus.valueOf(newStatus);

        // ❌ Đang thuê thì không cho đổi sang bất kỳ trạng thái nào khác
        if (current == VehicleStatus.RENTED && target != VehicleStatus.RENTED) {
            throw new RuntimeException("Xe đang được thuê. Trạng thái chỉ có thể thay đổi sau khi xe được trả lại.");
        }

        // ❌ Không cho set RENTED thủ công từ màn admin
        if (current != VehicleStatus.RENTED && target == VehicleStatus.RENTED) {
            throw new RuntimeException("Không thể đặt trạng thái 'Đang thuê' thủ công. Trạng thái này chỉ được cập nhật qua quy trình booking.");
        }

        // (Optional) Nếu đã DELETED thì không cho đổi nữa
        if (current == VehicleStatus.DELETED) {
            throw new RuntimeException("Xe đã bị xóa, không thể thay đổi trạng thái.");
        }

        vehicleDetail.setStatus(target);
//        vehicleDetail.setStatus(VehicleStatus.valueOf(newStatus));
        vehicleDetailRepository.save(vehicleDetail);

        return "Vehicle detail status updated successfully.";
    }

    public String createVehicleDetail(AdminCreateVehicleDetailRequest req, MultipartFile detailPicture) {
        VehicleModel vm = vehicleModelRepository.findById(req.getVehicleModelId())
                .orElseThrow(() -> new RuntimeException("Vehicle model not found with id: " + req.getVehicleModelId()));
        Station station = stationRepository.findById(req.getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + req.getStationId()));

        VehicleDetail vd = new VehicleDetail();
        vd.setLicensePlate(req.getLicensePlate());
        vd.setBatteryCapacity(req.getBatteryCapacity());
        vd.setOdo(req.getOdo());
        vd.setColor(req.getColor());
        vd.setStatus(VehicleStatus.AVAILABLE);
        vd.setPicture(imageUtil.encodeToBase64(detailPicture));
        vd.setStation(station);
        vd.setVehicleModel(vm);
        vehicleDetailRepository.save(vd);
        return "Vehicle detail created successfully.";
    }

    public String updateVehicleDetail(AdminUpdateVehicleDetailRequest req, MultipartFile detailPicture) {
        VehicleDetail vd = vehicleDetailRepository.findById(req.getDetailId())
                .orElseThrow(() -> new RuntimeException("Vehicle detail not found with id: " + req.getDetailId()));
        VehicleModel vm = vehicleModelRepository.findById(req.getVehicleModelId())
                .orElseThrow(() -> new RuntimeException("Vehicle model not found with id: " + req.getVehicleModelId()));
        Station station = stationRepository.findById(req.getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + req.getStationId()));

        vd.setLicensePlate(req.getLicensePlate());
        vd.setBatteryCapacity(req.getBatteryCapacity());
        vd.setOdo(req.getOdo());
        vd.setColor(req.getColor());
//        vd.setStatus(VehicleStatus.AVAILABLE);
//        if (detailPicture != null) {
//            vd.setPicture(imageUtil.encodeToBase64(detailPicture));
//        }
        vd.setStation(station);
        vd.setVehicleModel(vm);
        VehicleStatus current = vd.getStatus();     // Trạng thái hiện tại trong DB
        VehicleStatus target  = req.getStatus();
        // Đang thuê -> không được đổi sang bất kỳ trạng thái khác
        if (current == VehicleStatus.RENTED && target != VehicleStatus.RENTED) {
            throw new RuntimeException("Xe đang được thuê. Trạng thái chỉ có thể thay đổi sau khi xe được trả lại.");
        }

        // Không cho set RENTED thủ công
        if (current != VehicleStatus.RENTED && target == VehicleStatus.RENTED) {
            throw new RuntimeException("Không thể đặt trạng thái 'Đang thuê' thủ công. Trạng thái này chỉ được cập nhật qua quy trình booking.");
        }

        // Optional: khóa luôn DELETED
        if (current == VehicleStatus.DELETED && target != VehicleStatus.DELETED) {
            throw new RuntimeException("Xe đã bị xóa, không thể thay đổi trạng thái.");
        }

        vd.setStatus(target);
        if (detailPicture != null) {
            vd.setPicture(imageUtil.encodeToBase64(detailPicture));
        }
//        vd.setStatus(req.getStatus());
        vehicleDetailRepository.save(vd);
        return "Vehicle detail updated successfully.";
    }

    public AdminGetAllVehicleDetailResponse getVehicleDetailById(Integer vehicleDetailId) {
        VehicleDetail vd = vehicleDetailRepository.findById(vehicleDetailId)
                .orElseThrow(() -> new RuntimeException("VehicleDetail not found with id: " + vehicleDetailId));
        String randomId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        AdminGetAllVehicleDetailResponse resp = AdminGetAllVehicleDetailResponse.builder()
                .detailId(vd.getId())
                .licensePlate(vd.getLicensePlate())
                .batteryCapacity(vd.getBatteryCapacity())
                .odo(vd.getOdo())
                // Trả URL ảnh (backend tự phục vụ ở endpoint image/{id})
                .detailPicture("http://localhost:8084/EVRentalSystem/vehicle-management/image/" + vd.getId() + "/" + randomId)
                .status(vd.getStatus().toString())
                .color(vd.getColor())
                .build();

        VehicleModel vm = vd.getVehicleModel();
        if (vm != null) {
            resp.setModelId(vm.getVehicleId());
            resp.setBrand(vm.getBrand());
            resp.setModel(vm.getModel());
        }

        if (vd.getStation() != null) {
            resp.setStationId(vd.getStation().getStationId());
            resp.setStationName(vd.getStation().getStationName());
        }

        return resp;
    }

    public VehicleDetail findVehicleDetailEntity(Integer vehicleDetailId) {
        return vehicleDetailRepository.findById(vehicleDetailId)
                .orElseThrow(() -> new RuntimeException("VehicleDetail not found with id: " + vehicleDetailId));
    }
    // </editor-fold>

    // <editor-fold desc="This is the section for vehicle model management">
    public List<AdminGetAllModelResponse> getAllModels() {
        return vehicleModelRepository.findAll()
                .stream()
                .map(vm -> new AdminGetAllModelResponse(
                        vm.getVehicleId() == null ? null : vm.getVehicleId().intValue(), // nếu id là Long -> chuyển sang Integer
                        vm.getBrand(),
                        vm.getModel(),
                        vm.getPrice(),
                        vm.getSeats()
                ))
                .collect(Collectors.toList());
    }

    // Lấy tất cả entity VehicleModel để controller dùng
    public List<VehicleModel> findAllVehicleModels() {
        return vehicleModelRepository.findAll();
    }

    public AdminGetModelDetailResponse getModelDetail(Integer modelId) {
        VehicleModel vm = vehicleModelRepository.findById(modelId)
                .orElseThrow(() -> new RuntimeException("Vehicle model not found with id: " + modelId));
        String randomId = UUID.randomUUID().toString().replace("-", "").substring(0, 10);

        AdminGetModelDetailResponse resp = AdminGetModelDetailResponse.builder()
                .modelId(vm.getVehicleId())
                .brand(vm.getBrand())
                .model(vm.getModel())
                .price(vm.getPrice())
                .seats(vm.getSeats())
                .modelPicture("http://localhost:8084/EVRentalSystem/vehicle-management/model-image/" + vm.getVehicleId() + "/" + randomId)
                .build();
        return resp;
    }

    public VehicleModel findVehicleModelEntity(Integer modelId) {
        return vehicleModelRepository.findById(modelId)
                .orElseThrow(() -> new RuntimeException("VehicleDetail not found with id: " + modelId));
    }

    public String createVehicleModel(AdminCreateVehicleModelRequest req, MultipartFile modelPicture) {
        VehicleModel vm = new VehicleModel();
        vm.setBrand(req.getBrand());
        vm.setModel(req.getModel());
        vm.setPrice(req.getPrice());
        vm.setSeats(req.getSeats());
        vm.setPicture(imageUtil.encodeToBase64(modelPicture));
        vehicleModelRepository.save(vm);
        return "Vehicle detail created successfully.";
    }

    public String updateVehicleModel(AdminUpdateVehicleModelRequest req, MultipartFile modelPicture) {
        VehicleModel vm = vehicleModelRepository.findById(req.getModelId())
                .orElseThrow(() -> new RuntimeException("Vehicle model not found with id: " + req.getModelId()));
        vm.setBrand(req.getBrand());
        vm.setModel(req.getModel());
        vm.setPrice(req.getPrice());
        vm.setSeats(req.getSeats());
        if (modelPicture != null) {
            vm.setPicture(imageUtil.encodeToBase64(modelPicture));
        }
        vehicleModelRepository.save(vm);
        return "Vehicle model updated successfully.";
    }

    @Transactional(readOnly = true)
    public GetAllAboutStationResponse getAllAboutStation() {
        // 1. Lấy tất cả các trạm (để trạm hết xe vẫn hiện tên trong dropdown cấp 1)
        List<Station> allStations = stationRepository.findAll();

        // 2. Lấy xe chỉ có status AVAILABLE (SỬA Ở ĐÂY)
        List<VehicleDetail> availableVehicles = vehicleDetailRepository.findAllAvailableWithStationAndModel();

        // 3. Gom nhóm xe (Logic giữ nguyên)
        Map<Integer, Map<Integer, List<VehicleDetail>>> groupedData = availableVehicles.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getStation().getStationId(),
                        Collectors.groupingBy(v -> v.getVehicleModel().getVehicleId())
                ));

        // 4. Build DTO Response (Logic giữ nguyên)
        List<GetAllAboutStationResponse.StationDTO> stationDTOs = allStations.stream().map(station -> {

            // Lấy map model (nếu trạm không có xe available nào thì map này rỗng)
            Map<Integer, List<VehicleDetail>> modelsInStation = groupedData.getOrDefault(station.getStationId(), new HashMap<>());

            List<GetAllAboutStationResponse.ModelDTO> modelDTOs = modelsInStation.values().stream().map(vehicleList -> {
                VehicleModel modelEntity = vehicleList.get(0).getVehicleModel();

                List<GetAllAboutStationResponse.CarDTO> carDTOs = vehicleList.stream().map(v ->
                        GetAllAboutStationResponse.CarDTO.builder()
                                .vehicleDetailId(v.getId())
                                .licensePlate(v.getLicensePlate())
                                .color(v.getColor())
                                .status(v.getStatus())
                                .build()
                ).collect(Collectors.toList());

                return GetAllAboutStationResponse.ModelDTO.builder()
                        .vehicleModelId(modelEntity.getVehicleId())
                        .brand(modelEntity.getBrand())
                        .modelName(modelEntity.getModel())
                        .cars(carDTOs)
                        .build();
            }).collect(Collectors.toList());

            return GetAllAboutStationResponse.StationDTO.builder()
                    .stationId(station.getStationId())
                    .stationName(station.getStationName())
                    .models(modelDTOs)
                    .build();

        }).collect(Collectors.toList());

        return new GetAllAboutStationResponse(stationDTOs);
    }
    // </editor-fold>
}