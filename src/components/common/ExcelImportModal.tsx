import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'members' | 'supplements';
  onImportMembers?: (importedMembers: any[]) => void;
  onImportSupplements?: (importedSupplements: any[]) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  type,
  onImportMembers,
  onImportSupplements,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isMembers = type === 'members';

  // Generate and trigger download of a sample .xlsx template
  const handleDownloadSample = () => {
    try {
      let sampleData: any[] = [];
      let filename = '';

      if (isMembers) {
        filename = 'kaushik_fitness_members_sample.xlsx';
        sampleData = [
          {
            'Full Name': 'Virendra Netam',
            'Phone Number': '9826189010',
            'Age': 24,
            'Gender (male/female)': 'male',
            'Height (cm)': 176,
            'Weight (kg)': 74,
            'Plan Duration (1_month/3_months/6_months/1_year)': '3_months',
            'Workout Slot': '06:00 AM - 07:00 AM',
            'Discount Type (flat/percentage)': 'percentage',
            'Discount Value': 10,
            'Paid Amount (₹)': 2880,
          },
          {
            'Full Name': 'Pooja Kashyap',
            'Phone Number': '9826189020',
            'Age': 22,
            'Gender (male/female)': 'female',
            'Height (cm)': 162,
            'Weight (kg)': 55,
            'Plan Duration (1_month/3_months/6_months/1_year)': '6_months',
            'Workout Slot': '05:00 PM - 06:00 PM',
            'Discount Type (flat/percentage)': 'flat',
            'Discount Value': 500,
            'Paid Amount (₹)': 5300,
          },
          {
            'Full Name': 'Manish Som',
            'Phone Number': '9826189030',
            'Age': 28,
            'Gender (male/female)': 'male',
            'Height (cm)': 170,
            'Weight (kg)': 80,
            'Plan Duration (1_month/3_months/6_months/1_year)': '1_month',
            'Workout Slot': '07:00 AM - 08:00 AM',
            'Discount Type (flat/percentage)': 'flat',
            'Discount Value': 0,
            'Paid Amount (₹)': 1200,
          },
        ];
      } else {
        filename = 'kaushik_fitness_supplements_sample.xlsx';
        sampleData = [
          {
            'Product Name': 'Optimum Nutrition Gold Standard 100% Whey 2kg',
            'Brand': 'Optimum Nutrition',
            'Category (protein/creatine/preworkout/bcaa/gainer/vitamins)': 'protein',
            'Cost Price (₹)': 4800,
            'Selling Price (₹)': 6200,
            'Current Stock': 15,
            'Serving Size': '30g scoop',
            'Protein Per Serving (g)': 24,
          },
          {
            'Product Name': 'MuscleBlaze Creatine Monohydrate 250g',
            'Brand': 'MuscleBlaze',
            'Category (protein/creatine/preworkout/bcaa/gainer/vitamins)': 'creatine',
            'Cost Price (₹)': 650,
            'Selling Price (₹)': 999,
            'Current Stock': 25,
            'Serving Size': '3g scoop',
            'Protein Per Serving (g)': 0,
          },
        ];
      }

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, isMembers ? 'Members' : 'Supplements');
      XLSX.writeFile(workbook, filename);
    } catch (err: any) {
      alert('टेम्प्लेट डाउनलोड करने में त्रुटि: ' + (err.message || err));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setErrorMsg(null);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setErrorMsg('फ़ाइल खाली है या डेटा नहीं मिल सका। कृपया सही एक्सेल/सीएसवी चुनें।');
          setParsedData([]);
          setHeaders([]);
          return;
        }

        const detectedHeaders = Object.keys(rawJson[0]);
        setHeaders(detectedHeaders);
        setParsedData(rawJson);
      } catch (err: any) {
        setErrorMsg('एक्सेल फ़ाइल पढ़ने में त्रुटि: ' + (err.message || 'अमान्य फ़ाइल प्रारूप'));
      }
    };

    reader.readAsBinaryString(uploadedFile);
  };

  const handleExecuteImport = () => {
    if (!parsedData || parsedData.length === 0) return;

    if (isMembers) {
      const formattedMembers = parsedData.map((row) => {
        const name = row['Full Name'] || row['Name'] || row['नाम'] || 'Unnamed Member';
        const phone = String(row['Phone Number'] || row['Phone'] || row['मोबाइल'] || '9826199999').replace(/\D/g, '');
        const age = Number(row['Age'] || row['उम्र'] || 25);
        const genderRaw = String(row['Gender (male/female)'] || row['Gender'] || row['लिंग'] || 'male').toLowerCase();
        const gender = genderRaw.includes('f') || genderRaw.includes('महिला') ? 'female' : 'male';
        const heightCm = Number(row['Height (cm)'] || row['Height'] || 170);
        const weightKg = Number(row['Weight (kg)'] || row['Weight'] || 70);
        const durationRaw = String(row['Plan Duration (1_month/3_months/6_months/1_year)'] || row['Duration'] || '3_months');
        const duration = ['1_month', '3_months', '6_months', '1_year'].includes(durationRaw) ? durationRaw : '3_months';
        const workoutSlot = row['Workout Slot'] || row['Slot'] || '06:00 AM - 07:00 AM';
        const discountTypeRaw = String(row['Discount Type (flat/percentage)'] || row['Discount Type'] || 'flat').toLowerCase();
        const discountType = discountTypeRaw.includes('%') || discountTypeRaw.includes('percent') ? 'percentage' : 'flat';
        const discountValue = Number(row['Discount Value'] || row['Discount'] || 0);
        const paidAmount = Number(row['Paid Amount (₹)'] || row['Paid Amount'] || row['Paid'] || 0);

        return {
          name,
          phone,
          email: `${phone}@kaushikfitness.com`,
          age,
          gender,
          heightCm,
          weightKg,
          membershipDuration: duration,
          workoutSlot,
          discountType,
          discountValue,
          paidAmount,
        };
      });

      if (onImportMembers) {
        onImportMembers(formattedMembers);
      }
    } else {
      const formattedSupplements = parsedData.map((row) => {
        const name = row['Product Name'] || row['Name'] || 'Supplement Item';
        const brand = row['Brand'] || 'Kaushik Nutrition';
        const categoryRaw = String(row['Category (protein/creatine/preworkout/bcaa/gainer/vitamins)'] || row['Category'] || 'protein').toLowerCase();
        const costPrice = Number(row['Cost Price (₹)'] || row['Cost Price'] || 1000);
        const sellingPrice = Number(row['Selling Price (₹)'] || row['Selling Price'] || 1500);
        const currentStock = Number(row['Current Stock'] || row['Stock'] || 10);
        const servingSize = row['Serving Size'] || '1 scoop';
        const proteinPerServing = Number(row['Protein Per Serving (g)'] || 24);

        return {
          name,
          brand,
          category: categoryRaw,
          costPrice,
          sellingPrice,
          currentStock,
          servingSize,
          proteinPerServing,
        };
      });

      if (onImportSupplements) {
        onImportSupplements(formattedSupplements);
      }
    }

    setSuccessCount(parsedData.length);
    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } catch {}

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-900">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-wide">
                एक्सेल / CSV इम्पोर्ट (Excel Bulk Import)
              </h3>
              <p className="text-xs text-slate-300">
                {isMembers ? 'सदस्यों की सूची को एक्सेल से बल्क में आयात करें' : 'सप्लीमेंट्स स्टॉक इन्वेंटरी को एक्सेल से अपलोड करें'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Download Sample Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">
                  मानक एक्सेल टेम्प्लेट (Sample Template File)
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isMembers
                    ? 'नाम, मोबाइल, उम्र, प्लान, डिस्काउंट % व फीस कॉलम युक्त तैयार एक्सेल फ़ाइल'
                    : 'उत्पाद, ब्रांड, खरीद मूल्य, विक्रय मूल्य व स्टॉक कॉलम युक्त सैंपल फ़ाइल'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadSample}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>सैंपल एक्सेल डाउनलोड करें</span>
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <div className="font-bold text-sm text-slate-800">
              {file ? file.name : 'एक्सेल फ़ाइल चुनें या यहाँ ड्रैग करें'}
            </div>
            <p className="text-xs text-slate-400">
              समर्थित प्रारूप: .xlsx, .xls, .csv (अधिकतम 10MB)
            </p>
          </div>

          {/* Error Feedback */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Feedback */}
          {successCount !== null && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>सफलतापूर्वक {successCount} रिकॉर्ड्स आयात कर लिए गए!</span>
            </div>
          )}

          {/* Data Preview Table */}
          {parsedData.length > 0 && successCount === null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  डेटा प्रीव्यू ({parsedData.length} पंक्तियाँ पहचानी गईं):
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ✓ Ready to Import
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-48 scrollbar-thin">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                    <tr>
                      {headers.slice(0, 5).map((h, idx) => (
                        <th key={idx} className="p-2 border-b border-slate-200 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.slice(0, 8).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {headers.slice(0, 5).map((h, cIdx) => (
                          <td key={cIdx} className="p-2 text-slate-700 whitespace-nowrap">
                            {String(row[h] || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>

            <button
              type="button"
              disabled={parsedData.length === 0 || successCount !== null}
              onClick={handleExecuteImport}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{parsedData.length} रिकॉर्ड्स इम्पोर्ट करें (Import Now)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
