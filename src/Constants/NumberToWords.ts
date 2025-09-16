const NumberToWords = (num, curr = "Indian Rupee") => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  if (num === 0) return "Zero";

  const crores = Math.floor(num / 10000000);
  const lakhs = Math.floor((num % 10000000) / 100000);
  const thousands = Math.floor((num % 100000) / 1000);
  const hundreds = Math.floor((num % 1000) / 100);
  const remainder = num % 100;

  let result = "";

  if (crores > 0) result += `${ones[crores]} Crore `;
  if (lakhs > 0)
    result += `${lakhs < 20 && lakhs > 9
      ? teens[lakhs - 10]
      : (tens[Math.floor(lakhs / 10)] + " " + ones[lakhs % 10]).trim()
      } Lakh `;
  if (thousands > 0)
    result += `${thousands < 20 && thousands > 9
      ? teens[thousands - 10]
      : (tens[Math.floor(thousands / 10)] + " " + ones[thousands % 10]).trim()
      } Thousand `;
  if (hundreds > 0) result += `${ones[hundreds]} Hundred `;

  if (remainder > 0) {
    if (remainder < 10) {
      result += ones[remainder];
    } else if (remainder < 20) {
      result += teens[remainder - 10];
    } else {
      result += tens[Math.floor(remainder / 10)];
      if (remainder % 10 > 0) result += " " + ones[remainder % 10];
    }
  }

  return result.trim() + " " + curr;
};

export default NumberToWords;
