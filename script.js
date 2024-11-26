document.addEventListener("DOMContentLoaded", () => {
    const languageToggle = document.querySelector(".language-toggle");

    // -----------------------------
    // ระบบเปลี่ยนภาษา (Language Toggle)
    // -----------------------------
    if (languageToggle) {
        // โหลดภาษาเริ่มต้นจาก localStorage หรือใช้ "th-th" เป็นค่าเริ่มต้น
        let currentLanguage = localStorage.getItem("language") || "th-th";

        // ฟังก์ชันสำหรับอัปเดตข้อความตามภาษา
        function updateLanguage(language) {
            fetch(`./languages/${language}.json`)
                .then((response) => response.json())
                .then((data) => {
                    document.querySelectorAll("[data-lang-key]").forEach((element) => {
                        const key = element.getAttribute("data-lang-key");
                        if (data[key]) {
                            element.textContent = data[key];
                        }
                    });
                })
                .catch((error) => console.error("Error loading language file:", error));

            // บันทึกภาษาที่เลือกไว้ใน localStorage
            localStorage.setItem("language", language);
        }

        // เรียกใช้ภาษาเริ่มต้น
        updateLanguage(currentLanguage);

        // เปลี่ยนภาษาเมื่อคลิกปุ่ม
        languageToggle.addEventListener("click", () => {
            currentLanguage = currentLanguage === "th-th" ? "en-en" : "th-th";
            updateLanguage(currentLanguage);

            // โหลดข้อมูลสินค้าใหม่หลังจากเปลี่ยนภาษา
            if (productId) {
                fetchProductDetails(productId, currentLanguage);
            }
        });
    }

    // -----------------------------
    // ระบบดึงข้อมูลสินค้า (Product Details)
    // -----------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get("id")); // รับ ID สินค้าจาก URL

    // ฟังก์ชันดึงข้อมูลสินค้า
    function fetchProductDetails(productId, language) {
        fetch("./data.json")
            .then((response) => response.json())
            .then((data) => {
                const product = data.find((item) => item.id === productId);

                if (product) {
                    updateProductDetails(product, language);
                } else {
                    document.body.innerHTML = `<h1 data-lang-key="product_not_found">ไม่พบสินค้า</h1>`;
                }
            })
            .catch((error) => {
                console.error("Error loading product data:", error);
                document.body.innerHTML = `<h1 data-lang-key="data_load_error">เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า</h1>`;
            });
    }

    // ฟังก์ชันอัปเดตข้อมูลสินค้าในหน้า HTML
    function updateProductDetails(product, language) {
        const productName = document.getElementById("product-name");
        const productTitle = document.getElementById("product-title");
        const productDescription = document.getElementById("product-description");
        const productGallery = document.getElementById("product-gallery");
        const productDetails = document.getElementById("product-details");

        // อัปเดตชื่อสินค้า
        if (productName) productName.textContent = product.name[language];
        if (productTitle) productTitle.textContent = product.title[language];
        if (productDescription) productDescription.textContent = product.description[language];

        // อัปเดตแกลเลอรีรูปภาพ
        if (productGallery) {
            productGallery.innerHTML = ""; // ล้างข้อมูลเก่า
            const mainImage = document.createElement("img");
            mainImage.id = "main-image";
            mainImage.src = product.images[0];
            productGallery.appendChild(mainImage);

            const thumbnails = document.createElement("div");
            thumbnails.classList.add("thumbnails");

            product.images.forEach((image) => {
                const img = document.createElement("img");
                img.src = image;
                img.alt = product.name[language];
                img.onclick = () => {
                    mainImage.src = image;
                };
                thumbnails.appendChild(img);
            });

            productGallery.appendChild(thumbnails);
        }

        // อัปเดตรายละเอียดสินค้า
        if (productDetails) {
            productDetails.innerHTML = ""; // ล้างข้อมูลเก่า
            product.details.forEach((detail) => {
                const detailDiv = document.createElement("div");
                detailDiv.classList.add("details");

                const img = document.createElement("img");
                img.src = detail.image;
                img.alt = "รายละเอียดสินค้า";

                const text = document.createElement("p");
                text.textContent = detail.text[language];

                detailDiv.appendChild(img);
                detailDiv.appendChild(text);
                productDetails.appendChild(detailDiv);
            });
        }
    }

    // ถ้ามี ID สินค้าใน URL ให้ดึงข้อมูลสินค้า
    if (!isNaN(productId)) {
        fetchProductDetails(productId, localStorage.getItem("language") || "th-th");
    }
});