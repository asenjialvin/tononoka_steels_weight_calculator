# Tononoka Steel Slits & Sheets Theoretical Weight Calculator  

![License](https://img.shields.io/badge/license-Tononoka-blue.svg)  
![Status](https://img.shields.io/badge/status-active-brightgreen.svg)  
![Tech](https://img.shields.io/badge/tech-HTML5%20%7C%20CSS3%20%7C%20JS-orange.svg)  

A web-based tool by **Tononoka Steels** for calculating theoretical weights in **steel slitting and shearing processes**.  

---

## 📖 Overview  
The **Tononoka Steel Processing Weight Calculator** enables our production teams and partners to perform **accurate, real-time weight calculations** during slitting and shearing operations. By digitizing processes that were once manual, the tool improves **planning accuracy, operational efficiency, and decision-making** across Tononoka facilities.  

---

## 🚀 Features  

### 🔹 Slitting Calculator  
- Calculate theoretical weights of slits/ribbons from parent coils  
- Support for multiple slit combinations  
- Automatic scrap width & weight calculations  
- Results in a printable, detailed report  
- Dimensions displayed as *Thickness × Width* (e.g., `3.0 × 147`)  
- Rounded weights for easier handling  

### 🔹 Shearing Calculator  
- Calculate weights for cut-to-length sheets & plates  
- Supports **fully and partially sheared coils**  
- Prime & second-quality tracking  
- Automatic sheet width adjustment based on coil width  
- Scrap calculations for completed coils  
- Complex calculations with multiple sheet sizes  

---

## 🎨 User Experience  
- Industrial-themed, **Tononoka-branded interface**  
- Responsive design (desktop & mobile)  
- Tab-based navigation (Slitting ↔ Shearing)  
- Input validation & dynamic form fields  
- Print-ready reports for documentation  

---

## 🧮 Formulas Used  

### Slitting  
```
Ribbon Weight (kg) = (Ribbon Width × Coil Weight) ÷ (Coil Width + 10)
Scrap Weight       = Parent Coil Weight − Σ Ribbon Weights
Scrap Width        = Parent Coil Width − Σ Ribbon Widths
```

### Shearing  
```
SWP (8ft sheet) = (Thickness/1000) × (Width/1000) × (2440/1000) × 7850
Partially Sheared Coil: Weight per sheet = (SWP × Sheet Length) ÷ 2440
Fully Sheared Coil: Meterage-based calculation
```  

---

## 🛠️ Technology Stack  
- HTML5, CSS3, JavaScript (ES6)  
- Font Awesome Icons  
- Responsive layout with CSS Grid & Flexbox  
- Zero external dependencies  

### ✅ Browser Support  
- Chrome (recommended)  
- Firefox  
- Safari  
- Microsoft Edge  

---

## 📂 Installation & Setup  
No installation required.  

1. Clone or download this repository  
2. Open `index.html` in any modern browser  
3. Start using the calculator immediately  

---

## 💡 Usage Examples  

### Slitting  
- **Coil**: `3.0mm × 1040mm, 10000kg`  
- **Slits**: `7 ribbons of 147mm`  
- **Results**:  
  - Weight per slit: `1400kg`  
  - Total slit weight: `9800kg`  
  - Scrap width: `11mm`  
  - Scrap weight: `200kg`  

### Shearing  
- **Coil**: `1.0mm × 1215mm, 2901kg`  
- **Sheet**: `15000mm × 4ft × 1.0mm`  
- **Results**:  
  - Weight per sheet: `143.66kg`  

---

## 📜 License  
This project is proprietary to **Tononoka Steels**.  
For external use, please contact the Tononoka IT/Development team.  

---

## 📞 Support  
For issues, feature requests, or technical support, reach out to the **Tononoka Development Team/alvinasenji@gmail.com**.  

---

## 🔮 Future Enhancements  
- Export to **PDF & Excel**  
- User authentication & calculation history  
- Unit conversion (mm ↔ inches)  
- Mobile app version  
- REST API for ERP/MIS integration  
- Admin panel for data management  