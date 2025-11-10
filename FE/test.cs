using AirConditionerShop.BLL.Services;
using AirConditionerShop.DAL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace AirConditionerShop.DuongCongDat
{
    /// <summary>
    /// Interaction logic for DetailWindow.xaml
    /// </summary>
    public partial class DetailWindow : Window
    {
        public DetailWindow()
        {
            InitializeComponent();
        }

        //private AirConditioner _editedOne; //= selected bên main, gán vào qua hàm set() -> thay bằng property

        public AirConditioner EditedOne { get; set; }
        //cần 2 service bên detail
        private AirConService _airService = new(); //new luôn vì k sợ 
        private SupplierService _supplierService = new();


        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            //chẳng quan tâm mode, phải đổ vào combo cả 2 mode
            //tạo mới cũng chọn, edit cũng chọn NCC
            SupplierIdComboBox.ItemsSource = _supplierService.GetAllSuppliers();
            //thằng combo giống data grid là show nhiều dòng
            //nhưng grid show all cột, thằng combo chỉ show 1 cột
            SupplierIdComboBox.DisplayMemberPath = "SupplierName"; //treo đầu dê
            SupplierIdComboBox.SelectedValuePath = "SupplierId"; //bán thịt heo

            //Khoá ô id dù tạo mới hay là edit, do key tự tăng
            //key tự tăng, ô id bỏ trống, k cho gõ khi create new
            //key tự tăng, vẫn gán giá trị ở mode edit, nhưng cấm sửa khi edit luôn
            //
            AirConditionerIdTextBox.IsEnabled = false; //không cho sửa key

            //lưu ý: biến EditedOne chính là biến flag , biến cờ đánh dấu trạng thái
            if (EditedOne != null)
            {
                //AirConditionerIdTextBox.IsEnabled = false; //không cho sửa key
                DetailWindowMode.Content = "Fix the data";
                AirConditionerIdTextBox.Text = EditedOne.AirConditionerId.ToString();
                AirConditionerNameTextBox.Text = EditedOne.AirConditionerName;
                QuantityTextBox.Text = EditedOne.Quantity.ToString();
                DollarPriceTextBox.Text = EditedOne.DollarPrice.ToString();
                WarrantyTextBox.Text = EditedOne.Warranty;
                SoundPressureLevelTextBox.Text = EditedOne.SoundPressureLevel;
                FeatureFunctionTextBox.Text = EditedOne.FeatureFunction;

                //gán ngày tháng năm 
                ManuDatePicker.Text = EditedOne.ManufacturedDate.ToString();

                //còn cái fk, k show vào ô text, mà show qua treo đầu dê bán thịt heo
                //vì category, hay nhà sản xuất, nhà cung cấp là 1 bảng khác
                //id | name | quantity | price | ... | mã-hãng-sản-xuất Fk

                //id mã hãng sx | name tên hãng sx | country - quốc gia |
                //  H1                Samsung             Hàn Quốc
                //  H2                Toshiba             Nhật Bản
                //  H3                Daikin              Nhật Bản

            }
            else
            {
                DetailWindowMode.Content = "Create new";
            }
        }

        private bool CheckVar()
        {
            //toàn bộ các lệnh kiểm tra tính hợp lệ của các ô nhập -> đề thi yêu cầu: k ô nào được bỏ trống
            //name thì từ 5...50 character, số từ 50...100...
            //sai cái nào thì chửi cái đó, return false ngay!!!
            //check required, ô nhập đã gõ chưa, chưa quan tâm gõ đúng hay k, ta dùng hàm: string.IsNullOrWhiteSpace()

            //if (string.IsNullOrWhiteSpace(AirConditionerIdTextBox.Text))
            //{
            //    MessageBox.Show("AirConditionerId is required.", "Validation Error", MessageBoxButton.OK, MessageBoxImage.Warning);
            //    return false; // k nhập id chửi,thoát hàm, k cho save ở bên btn save
            //}

            //ngày tháng nhập vào k quá ngày hiện hành
            //C# so sánh ngày tháng dùng > >= < <= do nó đã cố tình cài đặt

            if (ManuDatePicker.SelectedDate == null)
            {
                MessageBox.Show("ManufacturedDate is required.", "Validation Error", MessageBoxButton.OK, MessageBoxImage.Warning);
                return false;
            }
            //nhập r, k cấm ngày hiện hành hôm nay
            if (ManuDatePicker.SelectedDate >= DateTime.Today)
            {
                MessageBox.Show("ManufacturedDate must less than today.", "Validation Error", MessageBoxButton.OK, MessageBoxImage.Warning);
                return false;
            }

            //Quantity [_____________], gõ ngọc trinh ->
            //                             int.Parse("ngọc trinh") -> ném ngoại lệ(exception)
            //                             phải bắt try catch
            //int.TryParse(chuỗi-cần-convert, out in result) -> true/false để nói rầng kí tự gõ vào đúng là số hay k, convert được hay k, k cần try catch

            if (string.IsNullOrWhiteSpace(AirConditionerNameTextBox.Text))
            {
                MessageBox.Show("AirConditionerName is required.", "Validation Error", MessageBoxButton.OK, MessageBoxImage.Warning);
                return false; // k nhập id chửi,thoát hàm, k cho save ở bên btn save
            }

            int len = AirConditionerNameTextBox.Text.Length;
            //lấy ra chiều dài của 1 chuỗi, chỉ việc lấy biến chuỗi chấm lenngth
            if (len < 5 || len > 50)
            {
                MessageBox.Show("AirConditionerName must be between 5 and 50 characters.", "Validation Error", MessageBoxButton.OK, MessageBoxImage.Warning);
                return false;
            }
            //chat sibidi: kiểm tra 1 ô nhập bắt buộc phải là số
            //Bước: đảm bảo nhập số
            //hàm int.parse() nguy hiểm -> ném ra ngoại lệ khi nó convert chữ số. Java y chang -> phải try catch
            //int .TryParse() k ném ngoại lệ, nhưng cách dùng phức tạp hơn 1 chút
            //Bước 2: đảm bảo số > min và số < max
            //if (số < min || số > max) -> chửi


            return true;
        }

        private void SaveButton_Click(object sender, RoutedEventArgs e)
        {
            //check var phải check trước khi save xuống table
            //if (CheckVar() == false)
            //{
            //    return; //dừng luôn k save
            //}

            //True       False  -> False
            //False      False   -> True
            if (!CheckVar())
            {
                return; //dừng luôn k save
            }

            //bạn gõ gì trên mành hình, tớ cất hết vào object aircon

            try
            {
                AirConditioner obj = new() { };

                if (EditedOne != null)
                {
                    //edit mode thì ta lấy id của ô nhập đập ngược trở lai object 
                    //để where trên id này để tự tăng
                    obj.AirConditionerId = int.Parse(AirConditionerIdTextBox.Text); //lấy object đang edit ra để gán lại giá trị mới
                }

                //obj.AirConditionerId = int.Parse(AirConditionerIdTextBox.Text);
                obj.AirConditionerName = AirConditionerNameTextBox.Text;
                obj.Quantity = int.Parse(QuantityTextBox.Text);
                obj.DollarPrice = double.Parse(DollarPriceTextBox.Text);
                obj.Warranty = WarrantyTextBox.Text;
                obj.SoundPressureLevel = SoundPressureLevelTextBox.Text;
                obj.FeatureFunction = FeatureFunctionTextBox.Text;
                obj.SupplierId = (String)SupplierIdComboBox.SelectedValue;
                obj.ManufacturedDate = ManuDatePicker.SelectedDate;
                //gán vào cuốn lịch thì .Text, lấy ra thi .SelectedDate

                if (EditedOne != null)
                {
                    _airService.UpdateAirCon(obj);
                    MessageBox.Show("Updated successfully!", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                else
                {
                    _airService.CreateAirCon(obj);
                    MessageBox.Show("Created successfully!", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                this.Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }

        }

        private void QuitButton_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }
    }
}
