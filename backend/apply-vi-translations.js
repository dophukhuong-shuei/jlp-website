// Áp dụng bản dịch tiếng Việt (do Claude dịch trực tiếp từ tiếng Nhật/Anh, không qua API dịch ngoài
// vì endpoint free bị rate-limit) làm nội dung MẶC ĐỊNH cho sản phẩm.
// Bản gốc được giữ lại trong metadata.title_original / description_original để không mất dữ liệu,
// và để nút đổi ngôn ngữ (Google Translate widget) dịch ngược lại đúng nghĩa sau này.
const BASE = "http://localhost:9000";

const CAUTION_VI =
  " Lưu ý: ◇ Sản phẩm này không hỗ trợ thanh toán khi nhận hàng (COD), PayPay hoặc chuyển khoản ngân hàng. Xin vui lòng lưu ý trước. ◇ Sản phẩm được giao qua Yamato Transport, Sagawa Express hoặc Japan Post. Không thể chỉ định đơn vị vận chuyển. ◇ Không nhận yêu cầu chỉ định ngày/giờ giao hàng. ◇ Tên người gửi trên phiếu giao hàng và hóa đơn có thể ghi tên trung tâm logistics khác với công ty chúng tôi. ◇ Nếu tổng giá trị đơn hàng có ghi chú trên từ 16.666 yên trở lên, có thể phát sinh phí phụ thu. Xin vui lòng lưu ý trước. ◇ Dù là 1 đơn hàng, hàng có thể được giao thành nhiều lần do khác kho hoặc đóng gói. Phiếu giao hàng cũng sẽ được chia theo từng phần nhưng không phát sinh thêm phí. ◇ Sản phẩm này không hỗ trợ gói quà.";

const T = {
  "Sisley Le Phyto Rouge Long Lasting Hydration Lipstick - 15 Beige Manhattan 3.4g": {
    title: "Sisley Le Phyto Rouge - Son Môi Dưỡng Ẩm Bền Màu - 15 Beige Manhattan 3.4g",
    description:
      "Lột tả đôi môi đầy cuốn hút. Đây là dòng son môi ấn tượng với hiệu quả dưỡng môi vượt trội. Sử dụng sắc tố nguyên chất, chỉ một lần tán đã cho độ phủ màu đậm đà và lớp hoàn thiện satin rạng rỡ. Kết cấu gel siêu mượt như chất lỏng, mang lại cảm giác thoải mái trong khi vẫn giữ màu lâu trôi. Kết hợp các vi cầu hyaluronic acid giúp môi căng mọng, ẩm mượt với sự chăm sóc đặc biệt. Công thức đàn hồi đa dạng đảm bảo hòa quyện cùng các loại dầu tự nhiên. Từ tông màu tự nhiên đến sắc màu nổi bật, đa dạng màu sắc phù hợp với mọi đôi môi.",
  },
  "Foundation Brush - Ultra-Soft Synthetic Bristle Makeup Brush": {
    title: "Cọ Tán Kem Nền - Lông Cọ Tổng Hợp Siêu Mềm",
    description:
      "Cọ chuyên dùng để hoàn thiện lớp kem nền. Loại cọ đặc biệt này có thể tán đều mọi loại kem nền một cách hoàn hảo. Thiết kế đầu cọ bo tròn đặc trưng, ôm sát làn da. Được làm từ lông tổng hợp mềm mại, mang lại cảm giác mịn màng và trải nghiệm trang điểm thoải mái.",
  },
  "Sisley Eyeliner Brush - Pinceau Traceur Paupières Professional Makeup Brush": {
    title: "Cọ Kẻ Mắt Sisley - Pinceau Traceur Paupières, Cọ Trang Điểm Chuyên Nghiệp",
    description:
      "Cọ lý tưởng giúp làm nổi bật vùng mắt. Đây là cọ chuyên nghiệp được thiết kế để làm rõ đường kẻ mí mắt. Hình dáng dẹt, thẳng cho lớp hoàn thiện lý tưởng. Mang lại cảm giác mềm mại cho vùng mắt, giúp đường kẻ sắc nét hơn. Chất lông mềm mại, dịu nhẹ cho da mà sợi tổng hợp thường không có được. Dễ dàng tạo màu theo ý muốn, giúp bạn thể hiện phong cách trang điểm mắt như mong đợi.",
  },
  "Facial Cleaning Tools": {
    title: "Dụng Cụ Làm Sạch Da Mặt",
    description:
      "Cọ rửa mặt giúp làm sạch da hiệu quả. Đầu lông mềm dịu nhẹ với da, loại bỏ lớp trang điểm và bụi bẩn hiệu quả. Thiết kế hai tác động mang lại hiệu quả làm sạch vượt trội.",
  },
  "Eyeshadow Smudge Brush - Soft Wavy Bristle Blending Brush": {
    title: "Cọ Đánh Bóng Mắt - Cọ Blend Lông Gợn Sóng Mềm Mại",
    description:
      "Cọ giúp tạo màu như ý. Đây là cọ mắt chuyên dùng để phối màu mượt mà. Cấu trúc lông gợn sóng mềm mại mang lại cảm giác thoải mái khi sử dụng. Phù hợp với mọi loại phấn mắt dạng bột và dạng nén, cho lớp hoàn thiện và màu sắc như ý. Món đồ giúp nâng tầm lớp trang điểm của bạn.",
  },
  "Eau Du Soir Perfumed Deodorant Spray - Alcohol-Based Long-Lasting Freshness 150ml": {
    title: "Xịt Khử Mùi Hương Nước Hoa Eau Du Soir - Gốc Cồn, Lưu Hương Bền Lâu 150ml",
    description:
      "Xịt khử mùi mang lại cảm giác sảng khoái với hương thơm dễ chịu. Dạng body mist chứa lượng cồn nhỏ, khô nhanh để bạn có thể mặc quần áo ngay. Hương thơm thanh mát lưu lại lâu, che phủ mùi cơ thể và giữ làn da tươi mới suốt cả ngày. Hương Eau du Soir hài hòa sang trọng, kết hợp giữa sự tươi mới của cam chanh và nét quyến rũ của hoa, cùng hương chypre lan tỏa. Hương giữa gồm lá cà chua, nhài, hương thảo geranium, hoa chuông và mận. Ở lớp hương cuối, rêu sồi, hoắc hương, gỗ đàn hương và musk tạo nên nền hương sâu lắng, ấm áp.",
  },
  "Phyto Lip Balm - Hydrating Beautifying Lip Balm 3g": {
    title: "Son Dưỡng Phyto - Dưỡng Ẩm Làm Đẹp Môi 3g",
    description:
      "Đôi môi rạng rỡ tràn đầy sức sống. Son dưỡng cao cấp mang lại độ ẩm và độ bóng cho môi, giúp môi căng mọng hơn. Chứa 95% thành phần có nguồn gốc tự nhiên, cung cấp độ ẩm chắc chắn. Bơ xoài, dầu argan và glucomannan từ củ konjac giúp môi mềm mại, dẻo dai. Tôn lên vẻ rạng rỡ tự nhiên cho mọi tông da, mang lại làn môi bóng khỏe, tràn đầy độ ẩm. Chiết xuất biển sâu và vitamin E giúp bảo vệ môi khỏi các yếu tố bên ngoài.",
  },
  "Fluid Foundation Brush - Flat Tapered Synthetic Bristle Makeup Brush": {
    title: "Cọ Tán Kem Nền Dạng Lỏng - Cọ Đầu Dẹt Vát Lông Tổng Hợp",
    description:
      "Cọ giúp hoàn thiện kem nền dạng lỏng. Đặc trưng bởi thiết kế dẹt, vát nhọn, giúp tán đều mọi loại kem nền lỏng, cho lớp hoàn thiện mượt mà. Sử dụng lông tổng hợp thẳng, kết cấu siêu mềm giúp tương thích tốt với kem nền, mang lại lớp trang điểm hoàn hảo theo ý bạn.",
  },
  "Blush Brush - Rounded Cut Soft Bristle Cheek Brush": {
    title: "Cọ Tán Má Hồng - Cọ Đầu Tròn Lông Mềm",
    description:
      "Cọ tán má hồng nhẹ nhàng. Thiết kế đầu tròn giúp làm nổi bật xương gò má. Cho lớp trang điểm nhanh, chính xác và dễ dàng. Lông cọ mềm mại, tán màu tự nhiên nhẹ nhàng trên da, mang lại cảm giác dịu nhẹ. Với cọ này, bạn dễ dàng tạo lớp má hồng hoàn hảo, tôn lên vẻ đẹp rạng rỡ cho gò má.",
  },
  "Phyto-Noir Volume & Lift Mascara - 15x More Volume, Clump-Free Formula 7ml": {
    title: "Mascara Phyto-Noir Volume & Lift - Dày Mi 15 Lần, Công Thức Không Vón Cục 7ml",
    description:
      "Hàng mi ấn tượng trong tầm tay! Mascara dưỡng mi cao cấp giúp tạo hàng mi dày và cong vút đầy sức sống. Chứa vitamin peptide và chiết xuất cây phục sinh, hỗ trợ và tiếp năng lượng cho mi. Công thức độc quyền không vón cục, giúp mi dày và dài trông thấy. Đầu cọ hình đồng hồ cát độc đáo giúp uốn cong mi mượt mà. Cho phép tùy chỉnh lớp mi từ chân đến ngọn đồng đều và đẹp mắt. Thiết kế đầu cọ theo công nghệ ergonomics phủ đều mi từ gốc đến ngọn. An toàn cho mắt nhạy cảm và người đang đeo kính áp tròng. Sản xuất tại Ý, đảm bảo chất lượng cao cấp.",
  },
  "Phyto Blush Twist - Long-Lasting Cream-To-Powder Blush 5.5g": {
    title: "Má Hồng Dạng Bút Phyto Blush Twist - Kem Chuyển Phấn Bền Màu 5.5g",
    description:
      "Kết hợp độ lên màu của dạng kem với vẻ đẹp tinh tế của phấn. Má hồng dạng thanh với độ trong và độ nổi khối ngay từ lần tán đầu, giữ màu sắc rực rỡ lâu trôi. Kết cấu kết hợp dầu và gel tạo hiệu ứng lấy nét mềm mại như phấn mịn. Tiện lợi mang theo, không cần gọt, dễ dàng sử dụng để có lớp trang điểm hoàn hảo. Thành phần dưỡng ẩm từ dầu trà và dầu hạt mỡ cùng dẫn xuất vitamin E giúp da luôn đủ ẩm.",
  },
  "Powder Brush - Rounded Soft Wavy Synthetic Bristle Makeup Brush": {
    title: "Cọ Phủ Phấn - Cọ Đầu Tròn Lông Gợn Sóng Mềm",
    description:
      "Cọ giúp hoàn thiện lớp trang điểm dễ dàng và đẹp mắt. Cọ này giúp phủ đều mọi loại phấn phủ dạng bột hay dạng nén một cách nhanh chóng. Đặc trưng bởi thiết kế đầu tròn rộng. Sử dụng lông tổng hợp gợn sóng mềm mại, mang lại lớp hoàn thiện tuyệt vời. Vật dụng cần thiết cho lớp trang điểm đẹp và làn da rạng ngời.",
  },
  "Phyto Cernes Eclat Eye Concealer - Tinted Anti-Dark Circles 15ml": {
    title: "Che Khuyết Điểm Vùng Mắt Phyto Cernes Eclat - Chống Thâm Mắt Có Màu 15ml",
    description:
      "Giải pháp mới cho vùng mắt tự nhiên rạng rỡ. Kem che khuyết điểm có màu với kết cấu mềm mại như kem, hòa hợp mượt mà với da. Chứa sắc tố tinh khiết cao, che phủ vùng thâm và tối màu quanh mắt. Chứa chiết xuất nho đỏ, cây kim sa và bạch quả giúp làm dịu vẻ mệt mỏi. Đầu áp kim loại mát lạnh giúp làm dịu và giảm sưng vùng mắt. Mang lại lớp hoàn thiện tự nhiên, giữ vùng mắt hoàn hảo suốt thời gian dài.",
  },
  "Hair Rituel Revitalizing Nourishing Shampoo With Moringa Oil 200ml": {
    title: "Dầu Gội Phục Hồi Dưỡng Chất Hair Rituel Với Dầu Moringa 200ml",
    description:
      "Dầu gội cấp ẩm chuyên sâu. Dầu gội phục hồi giúp làm sạch nhẹ nhàng và cung cấp dưỡng chất, giữ da đầu luôn thoải mái. Dầu thực vật thẩm thấu vào tóc, hỗ trợ chắc khỏe sợi tóc. Đặc biệt dầu Moringa giàu vitamin và khoáng chất, cấp ẩm cho tóc. Giảm tình trạng tóc xù, bao phủ tóc một cách tự nhiên. Ngay từ lần xả đầu tiên, tóc đã có cảm giác mềm mại như được ôm trọn. Tóc trở nên đẹp và mềm mại, phục hồi độ bóng mượt như lụa. Sản phẩm lý tưởng cho tóc khô, tóc rất khô và da đầu khô.",
  },
  "Sisley Hair Ritual Gentle Purifying Shampoo 200ml": {
    title: "Dầu Gội Làm Sạch Dịu Nhẹ Sisley Hair Ritual 200ml",
    description:
      "Dầu gội làm sạch da đầu dịu nhẹ, mang lại cảm giác sảng khoái tươi mới. Loại bỏ hiệu quả bụi bẩn, dầu thừa và cặn sản phẩm tạo kiểu bám trên da đầu và tóc. Chứa bisabolol có nguồn gốc tự nhiên, giúp làm dịu tóc và da đầu. Kết hợp chiết xuất trà Java, dầu hương thảo, dầu cỏ roi ngựa exotic và khoáng chất (kẽm, magie, đồng) giúp cân bằng môi trường da đầu và cấp ẩm.",
  },
  "Sisley Candle 165g (Tuberose)": {
    title: "Nến Thơm Sisley 165g (Hoa Huệ Tây)",
    description:
      "Nến thơm mang đến hương thơm sang trọng, sử dụng sáp paraffin và tim bấc cotton, tạo hương thơm tinh tế cho không gian sống. Hương thơm gợi lên sự tĩnh lặng của màn đêm, được tạo nên từ sự hòa quyện của các loại tinh dầu và thảo mộc quý. Thời gian cháy khoảng 45 giờ, cho bạn thưởng thức trong thời gian dài. Lọ thủy tinh sơn trắng mờ với thiết kế tinh tế, là điểm nhấn hoàn hảo cho không gian nội thất.",
  },
  "Sisley Hair Ritual The Blow-Dry Brush #2 1pc": {
    title: "Lược Sấy Tạo Kiểu Sisley Hair Ritual #2 1 Cái",
    description:
      "Lược tròn giúp làm thẳng tóc xoăn dày một cách dễ dàng. Mang lại hình dáng đẹp cho tóc thẳng, phù hợp từ kiểu sấy tạo gợn sóng đến tóc trung và dài. Sử dụng lông heo rừng giúp sấy khô nhẹ nhàng, lông mềm mại ôm sát tóc và sấy khô nhanh. Ngoài ra còn giữ tóc mềm mại, tạo độ bóng và giảm tình trạng tóc xoăn gợn.",
  },
  "Sisley Botanical Lotion With Tropical Resins 125ml": {
    title: "Nước Cân Bằng Thực Vật Sisley Với Nhựa Cây Nhiệt Đới 125ml",
    description:
      "Nước cân bằng chứa nhựa cây nhiệt đới cao cấp. Loại bỏ hiệu quả bụi bẩn và dầu thừa, mang lại cảm giác matte thanh thoát cho da. Sản phẩm lý tưởng cho chu trình dưỡng da buổi sáng, đặc biệt phù hợp với da dầu và da hỗn hợp. Cảm giác sử dụng tươi mát, giữ làn da sạch sẽ suốt cả ngày.",
  },
  "Sisley Buffing Face Cream 40ml": {
    title: "Kem Tẩy Da Chết Làm Sáng Da Sisley 40ml",
    description:
      "Chăm sóc tôn lên vẻ rạng rỡ. Sản phẩm tẩy tế bào chết giúp làn da trong suốt hơn. Hấp thụ và loại bỏ hiệu quả tế bào chết cũ và bụi bẩn tích tụ sâu trong lỗ chân lông. Công thức dịu nhẹ phù hợp với mọi loại da. Mỗi lần sử dụng đều mang lại làn da sáng khỏe, trong sạch.",
  },
  "Sisley Blur Expert 11g": {
    title: "Phấn Phủ Làm Mờ Lỗ Chân Lông Sisley Blur Expert 11g",
    description:
      "Phấn phủ dạng voan giúp làm mịn da và mang lại vẻ mượt mà. Kết cấu trong suốt, siêu nhẹ, bám da chắc chắn. Chứa phức hợp Light Matte HD, mang lại lớp hoàn thiện matte. Sự kết hợp giữa mica siêu tinh khiết và bột công nghệ cao tạo nên làn da tự nhiên, đẹp mắt. Hiệu ứng phản chiếu ánh sáng tuyệt vời giúp lớp trang điểm đẹp trong mọi hoàn cảnh. Tông màu trong suốt đa năng phù hợp với mọi loại da. Làm mịn bề mặt da, giảm sự xuất hiện của lỗ chân lông. Chỉ với một lần sử dụng, bạn có làn da sáng đều màu suốt cả ngày.",
  },
  "Sisley Eye & Lip Gel Make-Up Remover 120ml": {
    title: "Gel Tẩy Trang Vùng Mắt & Môi Sisley 120ml",
    description:
      "Gel tẩy trang thế hệ mới cho vùng mắt và môi. Sản phẩm giúp tẩy sạch lớp trang điểm hiệu quả trong khi vẫn mang lại hiệu quả dưỡng da. Kết cấu gel mềm mại, mượt mà, mang lại cảm giác tươi mát dễ chịu. Tẩy sạch hiệu quả cả lớp trang điểm chống nước cứng đầu một cách nhẹ nhàng. Giữ hàng mi khỏe mạnh trong khi tạo độ bóng mềm mại. Sau khi sử dụng, vùng mắt trở nên sạch sẽ, rạng rỡ hơn. Đã được kiểm nghiệm nhãn khoa, đảm bảo an toàn.",
  },
  "Hair Ritual By Sisley The Cream 230 150ml": {
    title: "Kem Dưỡng Tóc Hair Ritual By Sisley The Cream 230 150ml",
    description:
      "Kem dưỡng tóc không chứa silicone, được cô đặc đặc biệt với dầu thực vật quý và 230 thành phần dưỡng chất. Được kích hoạt bởi nhiệt, bảo vệ tóc khỏi các dụng cụ tạo kiểu lên tới 450°F (230°C). Kem này hỗ trợ tạo kiểu bằng máy duỗi hoặc máy sấy, mang lại vẻ đẹp tự nhiên cho tóc. Đồng thời cung cấp dưỡng chất, giảm xù tóc và giúp tóc dễ chải. Có thể dùng để tạo kiểu, làm mượt, hoặc như dầu xả thư giãn. Giữ tóc luôn mềm mại, mượt mà.",
  },
  "Hair Ritual The Brush 1pc": {
    title: "Lược Gỗ Massage Hair Ritual 1 Cái",
    description:
      "Lược gỗ chuyên dùng massage da đầu và tóc. Sử dụng thường xuyên giúp loại bỏ bụi bẩn và tạp chất bám trên tóc. Nhẹ nhàng gỡ rối, kích thích da đầu một cách thoải mái. Chải tóc với lược này giúp tóc trở nên mềm mại và có độ bóng tự nhiên.",
  },
  "Sisley Hair Rituel Curl Care Jelly 150ml": {
    title: "Gel Dưỡng Tóc Xoăn Sisley Hair Rituel Curl Care 150ml",
    description:
      "Gel dưỡng chuyên biệt cho tóc gợn sóng và xoăn nhẹ, giàu dưỡng chất. Kết hợp 3 loại dầu thực vật dừa, bơ hạt mỡ và moringa, cung cấp dưỡng chất và độ bóng đẹp cho tóc. Sáp jojoba và hướng dương thẩm thấu sâu vào tóc, định hình lọn xoăn đẹp, mềm mại và có độ đàn hồi. Kết cấu kem-gel mềm mại, tan chảy, mang lại hiệu quả chống xù lâu dài và bảo vệ khỏi độ ẩm. Dưỡng chất thực vật bảo vệ tóc khỏi tác hại nhiệt khi tạo kiểu.",
  },
  "Sisley Hair Ritual Precious Hair Care Oil 100ml": {
    title: "Dầu Dưỡng Tóc Cao Cấp Sisley Hair Ritual 100ml",
    description:
      "Vẻ rạng ngời của tóc thơm nhẹ như không trọng lượng. Dầu dưỡng tóc thơm nhẹ nhàng, không gây nặng tóc. Kết hợp dầu chanh dây, bơ hạt mỡ, dầu hạt bông và dầu moringa. Nhẹ nhàng cung cấp dưỡng chất và độ bóng cho tóc, mang lại cảm giác sử dụng nhẹ nhàng. Hương thơm tươi mới giúp tinh thần sảng khoái, làm tóc mềm mại và mượt mà hơn.",
  },
  "Sisley Radiant Glow Express Mask 60ml": {
    title: "Mặt Nạ Sáng Da Tức Thì Sisley Radiant Glow Express 60ml",
    description:
      "Mặt nạ giúp xóa tan vẻ xám xịt của da. Kết hợp đất sét đỏ, cà rốt, nho đỏ, tầm xuân và các loại tinh dầu hương thảo, cúc la mã cao cấp. Mặt nạ loại bỏ hiệu quả bụi bẩn và bít tắc lỗ chân lông, giúp da sạch sẽ, thông thoáng. Vẫn giữ độ ẩm cần thiết với kết cấu mềm mại, không gây cảm giác căng rít. Chỉ trong 3-5 phút, bạn có làn da sạch sẽ, đều màu và rạng rỡ.",
  },
  "Sisley Tropical Deep Purifying Mask 60ml": {
    title: "Mặt Nạ Làm Sạch Sâu Sisley Tropical Deep Purifying 60ml",
    description:
      "Mặt nạ kem làm sạch sâu tức thì, kết hợp đất sét có khả năng hấp thụ, làm sạch, làm se khít lỗ chân lông cùng nhựa cây nhiệt đới cao cấp. Giảm sự xuất hiện của lỗ chân lông mà không làm khô da, loại bỏ hiệu quả tạp chất. Không gây kích ứng bề mặt da, cải thiện làn da hỗn hợp và da dầu theo hướng hấp dẫn hơn. Kiểm soát vùng bóng dầu, cải thiện kết cấu da, mang lại làn da mềm mại, mịn màng, trong suốt và tông màu matte sáng. Mặt nạ kem này không gây bít lỗ chân lông, dịu nhẹ và an toàn khi sử dụng.",
  },
  "Sisleyum For Men Purifying Cleansing Gel 125ml": {
    title: "Gel Rửa Mặt Làm Sạch Sisleyum For Men 125ml",
    description:
      "Gel rửa mặt Sisleyum chăm sóc dịu nhẹ mà vẫn bảo vệ da, là sản phẩm không thể thiếu trong chu trình dưỡng da. Loại bỏ hiệu quả dầu thừa, bụi bẩn và vùng da xám xịt, đồng thời cấp ẩm và làm dịu da. Giải quyết nhiều vấn đề đặc trưng của nam giới như da bóng dầu, lỗ chân lông to, da khô sau khi cạo râu.",
  },
  "Sisley Energizing Foaming Exfoliant 200ml": {
    title: "Sữa Tẩy Tế Bào Chết Tạo Bọt Sisley Energizing 200ml",
    description:
      "Sản phẩm tẩy tế bào chết nhẹ nhàng loại bỏ tế bào da chết trên cơ thể, mang lại vẻ rạng rỡ mới cho da. Phù hợp với mọi loại da, mang lại cảm giác sử dụng dễ chịu. Giúp da trở nên tươi mới, mềm mại. Hãy sử dụng khi tắm để có những giây phút thư giãn sảng khoái.",
  },
  "Sisley Comfort Velvet Sleeping Mask 60ml": {
    title: "Mặt Nạ Ngủ Sisley Comfort Velvet 60ml",
    description:
      "Mặt nạ ngủ dịu nhẹ hỗ trợ hoạt động tự nhiên của da vào ban đêm. Cấp ẩm cho da khô suốt đêm, giúp duy trì trạng thái thoải mái. Sử dụng dồi dào thành phần thực vật, tập trung dưỡng chất và cấp ẩm chuyên sâu cho da. Chiết xuất hoa nghệ tây giúp làm dịu da khô. Hương mật hoa cam tự nhiên lan tỏa dịu dàng, mang lại cảm giác thư giãn. Làn da trở nên mềm mại, mượt mà và rạng rỡ. Có thể dùng như mặt nạ khẩn cấp SOS, chỉ 10 phút mang lại cảm giác an tâm và thoải mái.",
  },
  "Sisley Express Mask Flower Gel 60ml": {
    title: "Mặt Nạ Gel Hoa Tức Thì Sisley 60ml",
    description: "",
  },
  "Sisley Eye Contour Mask 30ml": {
    title: "Mặt Nạ Vùng Mắt Sisley Eye Contour 30ml",
    description:
      "Sản phẩm độc quyền của Sisley giúp làm dịu vùng mắt mệt mỏi. Làm mờ quầng thâm, giúp vùng mắt mệt mỏi trở nên gọn gàng, tươi sáng và săn chắc hơn. Cách dùng: sau khi thoa nước cân bằng lên vùng mắt sạch, lấy lượng vừa đủ thoa nhẹ nhàng quanh mắt, để yên 10 phút rồi lau nhẹ bằng bông hoặc khăn giấy. Cấp ẩm chắc chắn, ngăn ngừa khô da vùng mắt.",
  },
  "Sisley Black Rose Cream Mask 60ml": {
    title: "Mặt Nạ Kem Hoa Hồng Đen Sisley 60ml",
    description:
      "Mặt nạ với chiết xuất hoa hồng đen chống oxy hóa vượt trội, lá dây leo đỏ giúp cân bằng da, cùng tinh dầu hoa hồng, hoa mộc lan và vitamin E cao cấp. Mang lại làn da sáng khỏe và căng mịn.",
  },
  "Sisley Velvet Nourishing Body Cream With Saffron Flowers 200ml": {
    title: "Kem Dưỡng Thể Nhung Sisley Với Hoa Nghệ Tây 200ml",
    description:
      "Kem dưỡng thể giàu dưỡng chất mang lại cảm giác đặc biệt. Kết cấu mềm mại như nhung, tinh tế, mang lại làn da rạng rỡ. Với hai cách tiếp cận khác nhau cho ngày và đêm, bạn có thể trải nghiệm hiệu quả kép. Ban ngày, chiết xuất hạt kiều mạch giúp bảo vệ da vững chắc. Ban đêm, bơ hạt mỡ bổ sung dưỡng chất cần thiết cho da. Ngoài ra còn chứa chiết xuất Padina Pavonica và cỏ mạch môn Nhật Bản, tăng cường khả năng cấp ẩm. Chiết xuất hoa nghệ tây chăm sóc dịu nhẹ cho làn da dễ khô.",
  },
  "Sisley Eye Balm 30ml": {
    title: "Kem Dưỡng Vùng Mắt Sisley 30ml",
    description:
      "Sản phẩm chăm sóc ban ngày để bảo vệ vùng mắt mỏng manh và dễ khô. Bảo vệ chắc chắn khỏi tình trạng khô và khó chịu, mang lại độ ẩm và độ đàn hồi. Cảm giác sử dụng thoải mái, giúp vùng mắt tự tin, rạng rỡ.",
  },
  "Sisley Self Tanning Hydrating Facial Skin Care 60ml": {
    title: "Kem Dưỡng Tự Rám Nắng Cấp Ẩm Cho Mặt Sisley 60ml",
    description:
      "Kem tự rám nắng với cảm giác sử dụng nhẹ nhàng, hòa quyện mượt mà vào da. Lên màu đều, ngay cả người có da trắng cũng dễ dàng có làn da rám nắng. Sử dụng trong 4 tuần, bạn sẽ cảm nhận được tông màu da đẹp, đều và bền lâu. Cách dùng: sử dụng trên da sạch, khô (tẩy da chết trước sẽ hiệu quả hơn). Tránh vùng chân mày và chân tóc. Điều chỉnh theo tông màu mong muốn, khuyến nghị dùng 2-3 lần/tuần. Rửa sạch tay kỹ sau khi sử dụng.",
  },
  "Sisleÿa Essential Skin Care Lotion 150ml": {
    title: "Nước Cân Bằng Dưỡng Da Thiết Yếu Sisleÿa 150ml",
    description:
      "Nước cân bằng giúp làm đều kết cấu da với cảm giác sử dụng thanh mát dễ chịu. Sử dụng sản phẩm này giúp tăng khả năng thẩm thấu cho các bước dưỡng da tiếp theo. Chiết xuất cây thục quỳ (marshmallow), phytosqualane và chiết xuất bạch quả cung cấp độ ẩm và dưỡng chất cần thiết cho da. Nhẹ nhàng chăm sóc da bạn, mang lại làn da mềm mại, bóng khỏe và rạng rỡ.",
  },
  "Sisleyum For Men Revitalizing Toning Lotion 150ml": {
    title: "Nước Cân Bằng Săn Chắc Da Sisleyum For Men 150ml",
    description:
      "Nước cân bằng săn chắc từ bộ sưu tập Sisleyum bảo vệ mà vẫn chăm sóc dịu nhẹ cho da. Chăm sóc hiệu quả tình trạng nhờn và tổn thương do dầu thừa, giúp da săn chắc và gọn gàng. Ngoài ra còn hỗ trợ thẩm thấu tốt hơn cho các sản phẩm dưỡng da sau đó. Bộ sưu tập Sisleyum được nghiên cứu và phát triển đặc biệt để giải quyết ảnh hưởng của tuổi tác và lối sống lên da nam giới. Giải quyết đa chiều các vấn đề đặc trưng của nam giới như nhờn da, bóng dầu, lỗ chân lông to, tổn thương do cạo râu và khô da. Tập trung vào 3 tác động: 1. Chăm sóc chống lão hóa, 2. Chăm sóc cân bằng, 3. Bảo vệ da, mang lại công thức và chu trình chăm sóc lý tưởng.",
  },
  "Sisley Supremya The Supreme Anti Aging Skin Care Lotion 140ml": {
    title: "Nước Dưỡng Chống Lão Hóa Cao Cấp Sisley Supremya 140ml",
    description:
      "Nước dưỡng chống lão hóa chuẩn bị cho làn da tái tạo vào ban đêm. Kết cấu mượt mà như lụa, nhẹ và không nhờn rít. Khi massage, sản phẩm biến thành lớp màng ôm trọn da, mang lại cảm giác thư giãn. Chứa biosaccharide và glycerin có nguồn gốc thực vật, cung cấp độ ẩm dồi dào đồng thời hỗ trợ thẩm thấu cho các sản phẩm dưỡng da tiếp theo. Provitamin B5 thẩm thấu sâu vào da, giữ ẩm và làm dịu da. Ngoài ra, các tinh chất hoa hồng Damask, hoa mộc lan và geranium được pha trộn tinh tế, mang lại trải nghiệm sang trọng, thỏa mãn mọi giác quan. Phù hợp với mọi loại da, kể cả da nhạy cảm. Sản phẩm cao cấp sản xuất tại Pháp.",
  },
  "Sisleyum For Men Anti-Aging Mattifying Gel-Cream 50ml": {
    title: "Gel-Kem Chống Lão Hóa Kiềm Dầu Sisleyum For Men 50ml",
    description:
      "Sản phẩm chăm sóc chống lão hóa giải quyết đa chiều các vấn đề da của nam giới trong cuộc sống bận rộn. Bảo vệ da chắc chắn khỏi khô da do yếu tố bên ngoài, mang lại làn da căng mịn, khỏe khoắn. Kết cấu gel nhẹ giúp da săn chắc, mang lại lớp hoàn thiện matte. Thành phần độc quyền 'Kinkeliba Phytoactive' giúp ngăn ngừa kích ứng da và khô da do yếu tố bên ngoài, mang lại làn da săn chắc, khỏe mạnh. Phù hợp với da hỗn hợp đến da dầu.",
  },
  "Sisleyum Comfort Cream 50ml": {
    title: "Kem Dưỡng Sisleyum Comfort Cream 50ml",
    description:
      "Kem dưỡng ẩm hàng ngày giàu dưỡng chất, lớp hoàn thiện matte dễ chịu, dành cho nam giới da thường đến da khô. Kết cấu nhẹ nhàng, giàu dưỡng chất chứa phytoactive từ cây kinkeliba, giúp giảm căng thẳng cho da và bảo vệ khỏi kích ứng bên ngoài hàng ngày. Chiết xuất Isodon japonicus hỗ trợ độ săn chắc và tông màu da, adenosine giúp làm mịn kết cấu da, mang lại cảm giác mượt mà. Ngoài ra, phytoactive từ kinkeliba, chiết xuất lá liễu trắng và vitamin E acetate với tác dụng chống oxy hóa giúp da luôn thoải mái và tăng khả năng tự bảo vệ. Bơ hạt mỡ, dầu hướng dương và phytosqualane củng cố hàng rào bảo vệ da, giữ độ mềm mại mà không gây nặng da. Glycerin, niacinamide và natri hyaluronate cân bằng độ ẩm, cấp ẩm chắc chắn trong lớp hoàn thiện matte nhẹ nhàng.",
  },
  "Sisley Tropical Gentle Cleansing Gel 120ml": {
    title: "Gel Rửa Mặt Dịu Nhẹ Sisley Tropical 120ml",
    description:
      "Gel rửa mặt tạo bọt với công thức không xà phòng, không gây bít lỗ chân lông. Loại bỏ hiệu quả tạp chất và dầu thừa, mang lại làn da sảng khoái. Chứa nhựa cây nhiệt đới giúp làm sạch da và giữ da mềm mại. Chiết xuất thục quỳ (marshmallow) cấp ẩm trong khi làm sạch nhẹ nhàng. Ngoài ra còn chứa chiết xuất nhũ hương và mộc dược, giúp làm dịu da. Sử dụng hàng ngày cải thiện kết cấu da, giữ vẻ tươi mới, tự nhiên và làn da matte rạng rỡ. Đặc biệt phù hợp với da hỗn hợp và da dầu.",
  },
  "Sisley Self Tanning Hydrating Body Skin Care 150ml": {
    title: "Kem Dưỡng Tự Rám Nắng Cấp Ẩm Cho Cơ Thể Sisley 150ml",
    description:
      "Sản phẩm tự rám nắng cho cơ thể, cấp ẩm cho da trong khi mang lại làn da rám nắng tự nhiên. Kết cấu thẩm thấu nhanh, đặc trưng bởi khả năng lan đều. Trong vòng 2 giờ sau khi sử dụng, làn da rám nắng tự nhiên và đẹp mắt sẽ xuất hiện. Chiết xuất hạt dẻ và glycerin thực vật giúp bảo vệ độ ẩm cho da. Hương thơm tươi mới, dễ chịu mang lại cảm giác sảng khoái mỗi lần sử dụng.",
  },
  "Sisley L'Orchidée Highlighter Blush With White Lily 15g": {
    title: "Má Hồng Highlight Sisley L'Orchidée Với Bạch Huệ 15g",
    description:
      "Má hồng với cảm giác sử dụng nhẹ nhàng, dễ tán. Màu hồng đào lấy cảm hứng từ hoa lan - biểu tượng của Sisley. Chiết xuất bạch huệ bảo vệ da, ester, xà cừ và silicone tạo lớp hoàn thiện mượt mà, liền mạch. Mang lại làn da rạng rỡ như được ánh nắng chiếu vào. Sản phẩm tiện lợi có thể dùng để tạo khối, highlight hoặc làm má hồng.",
  },
  "ネクターシュブリーム セラム 30ml/1fl.oz.": {
    title: "Melvita Nectar Sublime - Serum 30ml/1fl.oz.",
    description: "Đỉnh cao nhất trong lịch sử Melvita. Đỉnh cao nhất trong lịch sử Melvita.",
  },
  "アルガン ビオアクティブ ナイトバーム 50ml": {
    title: "Melvita Argan Bio-Actif - Sáp Dưỡng Đêm 50ml",
    description: "Chăm sóc đêm sang trọng, sạc đầy độ ẩm. Chăm sóc đêm sang trọng, sạc đầy độ ẩm." + CAUTION_VI,
  },
  "アルガン ビオアクティブ クリーム 50ml": {
    title: "Melvita Argan Bio-Actif - Kem Dưỡng 50ml",
    description: "Độ ẩm từ thiên nhiên, làn da rạng rỡ. Độ ẩm từ thiên nhiên, làn da rạng rỡ." + CAUTION_VI,
  },
  "ネクターシュブリーム クリーム 50ml/1.7oz.": {
    title: "Melvita Nectar Sublime - Kem Dưỡng 50ml/1.7oz.",
    description:
      "Dòng sản phẩm chứa thành phần thay thế retinol có nguồn gốc thực vật. Dòng sản phẩm chứa thành phần thay thế retinol có nguồn gốc thực vật.",
  },
  "ネクターシュブリーム クリーム 50ml/リフィル": {
    title: "Melvita Nectar Sublime - Kem Dưỡng 50ml (Refill)",
    description:
      "Dòng sản phẩm chứa thành phần thay thế retinol có nguồn gốc thực vật. Dòng sản phẩm chứa thành phần thay thế retinol có nguồn gốc thực vật.",
  },
  "ロルベジタル ハイドレーティング ボディセラム 100ml": {
    title: "Melvita L'Or Végétal - Serum Dưỡng Ẩm Cơ Thể 100ml",
    description: "Serum sang trọng giúp làn da tươi mới. Serum sang trọng giúp làn da tươi mới." + CAUTION_VI,
  },
  "ロルロゼ ピンクフィット ボディオイル 2.0 100ml": {
    title: "Melvita L'Or Rose - Dầu Dưỡng Thể Pink Fit 2.0 100ml",
    description: "Dầu dưỡng khơi dậy vẻ đẹp tự nhiên. Dầu dưỡng khơi dậy vẻ đẹp tự nhiên." + CAUTION_VI,
  },
  "アルガン ビオアクティブ ナイトバームマスク 50ml": {
    title: "Melvita Argan Bio-Actif - Mặt Nạ Sáp Đêm 50ml",
    description: "Chứa argan lên men. Chăm sóc đêm hữu cơ đặc biệt. Chứa argan lên men. Chăm sóc đêm hữu cơ đặc biệt.",
  },
  "アルガン ビオアクティブ ナイトバーム 50ml/レフィル": {
    title: "Melvita Argan Bio-Actif - Sáp Dưỡng Đêm 50ml (Refill)",
    description: "Sáp dưỡng đêm chứa argan lên men. Sáp dưỡng đêm chứa argan lên men.",
  },
  "ソース デ ローズ ディーパフィング アイ ジェル 15ml": {
    title: "Melvita Source de Rose - Gel Dưỡng Vùng Mắt 15ml",
    description: "Gel dưỡng tươi mát cấp ẩm vùng mắt. Gel dưỡng tươi mát cấp ẩm vùng mắt." + CAUTION_VI,
  },
  "エクストラジェントル ファミリーシャンプー 1000ml/33.8fl.oz.": {
    title: "Melvita Extra Gentle - Dầu Gội Cho Cả Gia Đình 1000ml",
    description: "Dầu gội thiên nhiên dùng được cho cả gia đình. Dầu gội thiên nhiên dùng được cho cả gia đình.",
  },
  "エクストラジェントル シャワーシャンプー 1000ml/33.8fl.oz.": {
    title: "Melvita Extra Gentle - Sữa Tắm Gội 1000ml",
    description: "Làm sạch dịu nhẹ cho cả gia đình. Làm sạch dịu nhẹ cho cả gia đình.",
  },
  "フラワーウォーター リセットミスト ローズ 400ml": {
    title: "Melvita Eau Florale - Xịt Khoáng Hoa Hồng 400ml",
    description: "Nước hoa hồng giúp làn da tươi mới. Nước hoa hồng giúp làn da tươi mới." + CAUTION_VI,
  },
  "アルガン ビオアクティブ クリーム 50ml/レフィル": {
    title: "Melvita Argan Bio-Actif - Kem Dưỡng 50ml (Refill)",
    description: "Kem dưỡng mặt chứa argan lên men. Kem dưỡng mặt chứa argan lên men.",
  },
  "フリークエント ウォッシュ シャンプー 500ml/16.9fl.oz.": {
    title: "Melvita Frequent Wash - Dầu Gội Dùng Hàng Ngày 500ml",
    description: "Chăm sóc tóc dịu nhẹ, ôm trọn yêu thương. Chăm sóc tóc dịu nhẹ, ôm trọn yêu thương.",
  },
  "フラワーブーケ クレンジング ミルク 200ml": {
    title: "Melvita Bouquet Floral - Sữa Tẩy Trang 200ml",
    description: "Tẩy trang dịu nhẹ với sức mạnh từ thực vật. Tẩy trang dịu nhẹ với sức mạnh từ thực vật." + CAUTION_VI,
  },
  "ソルスデローズ フルイド 40ml/1.3fl.oz.": {
    title: "Melvita Sols de Rose - Dưỡng Chất Dạng Lỏng 40ml",
    description: "Dưỡng chất sang trọng cho làn da căng mọng. Dưỡng chất sang trọng cho làn da căng mọng.",
  },
  "フラワーブーケ ジェントル ミセラー ウォーター 200ml": {
    title: "Melvita Bouquet Floral - Nước Tẩy Trang Micellar 200ml",
    description: "Tẩy trang tươi mới, dịu nhẹ cho da. Tẩy trang tươi mới, dịu nhẹ cho da." + CAUTION_VI,
  },
  "ロルロゼ アクティベート オイルインバーム 170ml/5.8oz.": {
    title: "Melvita L'Or Rose - Sáp Dưỡng Kích Hoạt Oil-In-Balm 170ml",
    description: "Tan chảy mượt mà, làn da săn chắc. Tan chảy mượt mà, làn da săn chắc.",
  },
  "ロルロゼ ピンクフィット ボディオイル 2.0 100ml/3.3fl.oz.": {
    title: "Melvita L'Or Rose - Dầu Dưỡng Thể Pink Fit 2.0 100ml/3.3fl.oz.",
    description: "",
  },
  "ネクターカルム STG バーム 40ml/1.4oz.": {
    title: "Melvita Nectar Calme - Sáp Dưỡng STG 40ml",
    description: "Sáp chăm sóc làn da dễ kích ứng, mất cân bằng. Sáp chăm sóc làn da dễ kích ứng, mất cân bằng.",
  },
  "フラワーウォーター ゼラニウム 200ml": {
    title: "Melvita Eau Florale - Nước Hoa Hồng Geranium 200ml",
    description: "Chăm sóc dịu nhẹ với hương hoa cho da. Chăm sóc dịu nhẹ với hương hoa cho da." + CAUTION_VI,
  },
  "ラニュイ トレゾア オードパルファム 100ml": {
    title: "Lancôme La Nuit Trésor - Nước Hoa Eau de Parfum 100ml",
    description: "Hương thơm huyền hoặc, gợi cảm cho đêm. Hương thơm huyền hoặc, gợi cảm cho đêm.",
  },
  "【国内正規品】UV コンフォート ウルトラ プロテクト 50ml 日焼け止め UVプロテクト SPF50+ PA++++ ウォータープルーフ 撥水 崩れ防止": {
    title: "【Hàng chính hãng nội địa Nhật】UV Comfort Ultra Protect 50ml - Kem Chống Nắng SPF50+ PA++++ Chống Nước, Không Trôi",
    description:
      "【Hàng chính hãng nội địa Nhật】Bảo vệ da vượt trội trước tia UV mạnh, có khả năng chống mồ hôi, nước và dầu nhờn cao — kem chống nắng dạng sữa cao cấp \"UV Comfort Ultra Protect (50ml) SPF50+ / PA++++\" chính thức ra mắt.\n\nĐạt chuẩn bảo vệ cao nhất tại Nhật (SPF50+ / PA++++), sản phẩm chặn đứng tia UV-A và UV-B gây sạm da, nám, tàn nhang không chỉ trong sinh hoạt hàng ngày mà cả khi đi biển hay hoạt động ngoài trời.\n\n【Điểm nổi bật của sản phẩm】\n● Chống nước và đa năng vượt trội: bền với mồ hôi, nước, dầu nhờn và ma sát, hiệu quả lâu bền khi đi biển, bể bơi hay chơi thể thao.\n● Cảm giác sử dụng thoải mái (UV Comfort): không nhờn rít, không để lại vết trắng, kết cấu nhẹ và mọng nước bám sát da ngay lập tức.\n● Kiểm soát dầu & chống trôi: hạn chế bóng nhờn do dầu thừa, đồng thời có thể dùng như lớp lót trang điểm hiệu quả.\n● Hiệu quả dưỡng da: bảo vệ da khỏi khô do tia UV, duy trì làn da khỏe mạnh, đủ ẩm.\n\nLà vật dụng chống nắng cần thiết mỗi ngày — từ đi làm, đi học, ra ngoài lâu đến hoạt động ngoài trời — bảo vệ da suốt cả ngày một cách thoải mái.\n\n【Đặc điểm sản phẩm】\n● Khả năng chống UV cao nhất: SPF50+ / PA++++ bảo vệ da triệt để khỏi tia cực tím.\n● Bền với mồ hôi, nước, dầu nhờn: công thức đa năng chống nước, chống mồ hôi và dầu vượt trội.\n● Không để vết trắng, không nhờn rít: cảm giác sử dụng nhẹ nhàng, hòa vào da tự nhiên.\n● Cấp ẩm & lót trang điểm: giữ ẩm cho da, giúp lớp kem nền bám tốt hơn.\n\n【Phù hợp cho ai】\nNgười tuyệt đối không muốn bị sạm da, nám / người tìm kem chống nắng chống nước bền với mồ hôi / người dùng cho thể thao, du lịch, hoạt động ngoài trời / người muốn cảm giác thoải mái, không nhờn rít, không vết trắng / người tìm kem chống nắng dùng được như lớp lót trang điểm.\n\n【Cách dùng】\n- Lắc nhẹ trước khi dùng (nếu là dạng 2 lớp).\n- Dùng lượng vừa đủ vào cuối chu trình dưỡng da buổi sáng, hoặc trước khi trang điểm.\n- Thoa đều lên mặt, cổ và các vùng da cần thiết trên cơ thể.\n- Sau khi đổ mồ hôi hoặc lau bằng khăn, nên thoa lại thường xuyên để duy trì hiệu quả.\n\n【Thông tin sản phẩm】\n- Tên sản phẩm: UV Comfort Ultra Protect\n- Dung tích: 50ml\n- Chỉ số bảo vệ: SPF50+ / PA++++\n- Công dụng: Chống nước vượt trội / Chống dầu / Chống mồ hôi / Chống tia UV\n- Loại: Kem chống nắng dạng sữa\n- Tình trạng sản phẩm: Mới, chưa mở hộp (hàng chính hãng)",
  },
  "【国内正規品】フィトチューン フォーミング ウォッシュ 200ml 2個セット 洗顔フォーム 泡洗顔 毛穴ケア 保湿 植物エキス": {
    title: "【Hàng chính hãng nội địa Nhật】Phytotune Foaming Wash 200ml - Bộ 2 Sữa Rửa Mặt Tạo Bọt, Ngừa Mụn, Cấp Ẩm",
    description:
      "【Hàng chính hãng nội địa Nhật】Ôm trọn làn da bằng dưỡng chất thực vật, làm sạch sâu bụi bẩn trong lỗ chân lông và tế bào chết cũ — sữa rửa mặt tạo bọt được yêu thích \"Phytotune Foaming Wash 200ml (bộ 2 tiết kiệm)\" chính thức ra mắt.\n\nChỉ cần nhấn vòi bơm, bọt mịn dày và có độ đàn hồi sẽ tự trào ra, tạo lớp đệm giữa tay và da, giúp rửa mặt nhẹ nhàng mà không gây ma sát. Kết hợp chiết xuất thực vật (thảo mộc & botanical) chọn lọc kỹ càng, cân bằng độ ẩm cho da trong khi mang lại làn da trong sáng, mềm mại.\n\n【Điểm nổi bật của sản phẩm】\n● Bọt dày mịn: chỉ cần nhấn vòi bơm là có ngay lớp bọt lý tưởng, rửa mặt sáng tối mỗi ngày nhanh chóng và dễ dàng.\n● Chăm sóc lỗ chân lông & tế bào chết: nhẹ nhàng loại bỏ bụi bẩn sâu trong lỗ chân lông, dầu thừa và tế bào chết gây xám da.\n● Dưỡng chất từ thực vật: sau khi rửa mặt không gây căng rít, giữ làn da mềm mại, mượt mà.\n● Bộ 2 tiết kiệm: dung tích lớn 200ml x 2 chai, dùng thoải mái cho việc chăm sóc da hàng ngày.\n\nKhông chỉ dùng rửa mặt hàng ngày, sản phẩm còn phù hợp làm chăm sóc đặc biệt khi da sần sùi, lỗ chân lông to hoặc vào mùa khô. Hương thảo mộc xanh thanh mát mang lại cảm giác thư giãn mỗi lần rửa mặt.\n\n【Đặc điểm sản phẩm】\n● Dạng bọt không cần tạo bọt tay: chỉ cần nhấn vòi bơm là có ngay lớp bọt mịn, mềm.\n● Dưỡng chất từ thực vật (botanical): làm đều kết cấu da, làm mềm da đã trở nên cứng.\n● Làm sạch lỗ chân lông & dầu thừa: giảm ma sát trong khi hút sạch bụi bẩn hiệu quả.\n● Bộ 2 chai tiết kiệm: 200ml x 2 chai tiện lợi cho việc dùng hàng ngày.\n\n【Phù hợp cho ai】\nNgười muốn rửa mặt tiện lợi mà không cần tạo bọt tay / người lo lỗ chân lông đen, da sần sùi, xám da / người có da khô, da nhạy cảm dễ căng rít sau khi rửa mặt / người tìm sản phẩm dưỡng da từ thực vật / người muốn mua bộ tiết kiệm.\n\n【Cách dùng】\n- Làm ướt mặt nhẹ nhàng trước khi sử dụng.\n- Nhấn vòi bơm 2-3 lần lấy bọt vào tay, nhẹ nhàng thoa đều lên toàn mặt.\n- Massage nhẹ nhàng theo hình tròn để bọt ôm trọn da, sau đó rửa sạch bằng nước hoặc nước ấm.",
  },
};

// "Eyeliners" dùng chung title nhưng 2 biến thể description khác nhau (theo ID cụ thể)
const EYELINER_A =
  "Đường kẻ hoàn hảo, màu sắc rực rỡ! Đường kẻ hoàn hảo, màu sắc rực rỡ!" + CAUTION_VI;
const EYELINER_B = "Trang điểm > Bút Kẻ Mắt Dạng Nước";
const EYELINER_TITLE = "Bút Kẻ Mắt";
const EYELINER_BY_ID = {
  prod_01M0VF4H2VBMQDMBB8EJ7TFYB3: EYELINER_A,
  prod_01M0VF4H5HHBTFF7GHBGSFW2VE: EYELINER_B,
  prod_01M0VF4H85ZFGA1EZMB8MZ6JJS: EYELINER_A,
  prod_01M0VF4HAP4XB92FFCYD6XRNXX: EYELINER_B,
  prod_01M0VF4HD932RDFJJFMKA1ZH7E: EYELINER_B,
  prod_01M0VF4HKDYTS036MB68EQ3DMT: EYELINER_B,
  prod_01M0VF4HQ6JRED1502P3BNR6VB: EYELINER_B,
  prod_01M0VF4HSPVW4YWZ869ZEZM8BV: EYELINER_A,
  prod_01M0VF4HX4S2X5PNXWHHJHM1RT: EYELINER_A,
  prod_01M0VF63RD1P5ANKMNPDNM0XE5: EYELINER_A,
};

async function login() {
  const res = await fetch(`${BASE}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@jlb.local", password: "JlbAdmin123!" }),
  });
  return (await res.json()).token;
}

async function api(token, path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(`${options.method || "GET"} ${path} -> ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  const token = await login();
  const { products } = await api(token, "/admin/products?limit=1000&fields=id,title,description,metadata");
  console.log(`total products: ${products.length}`);

  let done = 0;
  let skipped = 0;
  for (const p of products) {
    if (p.metadata?.vi_translated) {
      skipped++;
      continue;
    }

    let viTitle;
    let viDesc;
    if (EYELINER_BY_ID[p.id]) {
      viTitle = EYELINER_TITLE;
      viDesc = EYELINER_BY_ID[p.id];
    } else if (T[p.title]) {
      viTitle = T[p.title].title;
      viDesc = T[p.title].description;
    } else {
      console.log("NO TRANSLATION FOUND, skipping:", p.title);
      continue;
    }

    const metadata = {
      ...p.metadata,
      vi_translated: true,
      title_original: p.title,
      description_original: p.description,
    };

    await api(token, `/admin/products/${p.id}`, {
      method: "POST",
      body: JSON.stringify({ title: viTitle, description: viDesc, metadata }),
    });
    done++;
    console.log(`[${done}]`, viTitle);
  }

  console.log(`\nDone. Translated ${done}, skipped ${skipped}, total ${products.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
