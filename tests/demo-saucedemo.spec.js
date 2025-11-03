const { test, expect } = require('@playwright/test');

// Sử dụng test.describe để nhóm các test case lại thành một Test Suite
test.describe('Kịch bản Đăng nhập Saucedemo', () => {

    // Hook: Chạy trước mỗi test case
    test.beforeEach(async ({ page }) => {
        // 1. Action: Điều hướng đến trang đăng nhập
        await page.goto('https://www.saucedemo.com');
    });

    // Test case 1: Đăng nhập thành công (Happy Path)
    test('TC1: Đăng nhập thành công với tài khoản hợp lệ', async ({ page }) => {
        
        await page.locator('#user-name').fill('standard_user');
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();

        // Kiểm tra đã vào đúng trang inventory
        await expect(page).toHaveURL(/.*\/inventory.html/);
        
        // Kiểm tra tiêu đề "Products" hiển thị
        const title = page.locator('.title');
        await expect(title).toBeVisible();
        await expect(title).toHaveText('Products');
    });

    // Test case 2: (Sửa) Đăng nhập thất bại (sai cả 2)
    test('TC2: Hiển thị lỗi khi sai cả username và password', async ({ page }) => {
        
        await page.locator('#user-name').fill('wrong_user');
        await page.locator('#password').fill('wrong_password');
        await page.locator('#login-button').click();

        // Kiểm tra thông báo lỗi
        const errorMessage = page.getByText('Epic sadface: Username and password do not match any user in this service');
        await expect(errorMessage).toBeVisible();
    });

    // Test case 3: (Mới) Bỏ trống username
    test('TC3: Hiển thị lỗi khi bỏ trống username', async ({ page }) => {
        
        // Bỏ trống username, điền password
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();

        // Kiểm tra thông báo lỗi
        const errorMessage = page.getByText('Epic sadface: Username is required');
        await expect(errorMessage).toBeVisible();
    });

    // Test case 4: (Mới) Bỏ trống password
    test('TC4: Hiển thị lỗi khi bỏ trống password', async ({ page }) => {
        
        // Điền username, bỏ trống password
        await page.locator('#user-name').fill('standard_user');
        await page.locator('#login-button').click();

        // Kiểm tra thông báo lỗi
        const errorMessage = page.getByText('Epic sadface: Password is required');
        await expect(errorMessage).toBeVisible();
    });

    // Test case 5: (Mới) Sai username, đúng password
    test('TC5: Hiển thị lỗi khi sai username, đúng password', async ({ page }) => {
        
        await page.locator('#user-name').fill('fail_user');
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();

        // Kiểm tra thông báo lỗi (giống TC2)
        const errorMessage = page.getByText('Epic sadface: Username and password do not match any user in this service');
        await expect(errorMessage).toBeVisible();
    });

    // Test case 6: (Mới) Đúng username, sai password
    test('TC6: Hiển thị lỗi khi đúng username, sai password', async ({ page }) => {
        
        await page.locator('#user-name').fill('standard_user');
        await page.locator('#password').fill('fail_password');
        await page.locator('#login-button').click();

        // Kiểm tra thông báo lỗi (giống TC2)
        const errorMessage = page.getByText('Epic sadface: Username and password do not match any user in this service');
        await expect(errorMessage).toBeVisible();
    });

});
test.describe('Kịch bản - Chức năng Sắp xếp sản phẩm', () => {

    // Hook: Đăng nhập trước mỗi test
    test.beforeEach(async ({ page }) => {
        await page.goto('https://www.saucedemo.com');
        await page.locator('#user-name').fill('standard_user');
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();
        await expect(page).toHaveURL(/.*\/inventory.html/);
    });

    // Hàm trợ giúp để lấy text từ mảng các locators
    async function getItemNames(page) {
        return await page.locator('.inventory_item_name').allTextContents();
    }

    // Hàm trợ giúp để lấy giá (dưới dạng số)
    async function getItemPrices(page) {
        const priceTexts = await page.locator('.inventory_item_price').allTextContents();
        // Chuyển "$29.99" thành số 29.99
        return priceTexts.map(text => parseFloat(text.replace('$', '')));
    }

    // Test case 10: Sắp xếp Tên (A đến Z) - Mặc định
    test('TC10: Sắp xếp Tên (A đến Z) - Mặc định', async ({ page }) => {
        // Lấy danh sách tên hiện tại (mặc định)
        const itemNames = await getItemNames(page);

        // Tạo danh sách tên đã được sort A-Z để so sánh
        const sortedNames = [...itemNames].sort(); // Sort A-Z

        // Assertion: Kiểm tra xem 2 mảng có giống hệt nhau không
        expect(itemNames).toEqual(sortedNames);
    });

    // Test case 11: Sắp xếp Tên (Z đến A)
    test('TC11: Sắp xếp Tên (Z đến A)', async ({ page }) => {
        // 1. Action: Chọn sort Z-A
        await page.locator('.product_sort_container').selectOption('za');

        // 2. Lấy danh sách tên sau khi sort
        const itemNames = await getItemNames(page);
        
        // 3. Tạo danh sách tên đã được sort Z-A để so sánh
        const sortedNames = [...itemNames].sort().reverse(); // Sort Z-A

        // 4. Assertion: Kiểm tra 2 mảng
        expect(itemNames).toEqual(sortedNames);
    });

    // Test case 12: Sắp xếp Giá (Thấp đến Cao)
    test('TC12: Sắp xếp Giá (Thấp đến Cao)', async ({ page }) => {
        // 1. Action: Chọn sort 'lohi'
        await page.locator('.product_sort_container').selectOption('lohi');

        // 2. Lấy danh sách giá sau khi sort
        const itemPrices = await getItemPrices(page);
        
        // 3. Tạo danh sách giá đã được sort Thấp-Cao để so sánh
        const sortedPrices = [...itemPrices].sort((a, b) => a - b); // Sort số tăng dần

        // 4. Assertion: Kiểm tra 2 mảng
        expect(itemPrices).toEqual(sortedPrices);
    });

    // Test case 13: Sắp xếp Giá (Cao đến Thấp)
    test('TC13: Sắp xếp Giá (Cao đến Thấp)', async ({ page }) => {
        // 1. Action: Chọn sort 'hilo'
        await page.locator('.product_sort_container').selectOption('hilo');

        // 2. Lấy danh sách giá sau khi sort
        const itemPrices = await getItemPrices(page);
        
        // 3. Tạo danh sách giá đã được sort Cao-Thấp để so sánh
        const sortedPrices = [...itemPrices].sort((a, b) => b - a); // Sort số giảm dần

        // 4. Assertion: Kiểm tra 2 mảng
        expect(itemPrices).toEqual(sortedPrices);
    });
});
test.describe('Kịch bản E2E - Luồng mua hàng', () => {

    // Hook: Chạy trước MỖI test trong nhóm này
    test.beforeEach(async ({ page }) => {
        // 1. Tới trang đăng nhập
        await page.goto('https://www.saucedemo.com');
        
        // 2. Tự động đăng nhập (tài khoản chuẩn)
        await page.locator('#user-name').fill('standard_user');
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();
        
        // 3. Đảm bảo đã vào trang sản phẩm
        await expect(page).toHaveURL(/.*\/inventory.html/);
    });

    // Test case 7: Thêm sản phẩm vào giỏ hàng
    test('TC7: Thêm sản phẩm vào giỏ hàng thành công', async ({ page }) => {
        // Tên sản phẩm để kiểm tra
        const productName = 'Sauce Labs Backpack';

        // 1. Action: Click nút "Add to cart" của sản phẩm
        // Chúng ta tìm nút add-to-cart dựa trên tên sản phẩm
        await page.locator('.inventory_item')
            .filter({ hasText: productName })
            .getByRole('button', { name: 'Add to cart' })
            .click();

        // 2. Assertion: Kiểm tra icon giỏ hàng
        // Icon giỏ hàng phải hiển thị số '1'
        const cartBadge = page.locator('.shopping_cart_badge');
        await expect(cartBadge).toHaveText('1');

        // 3. Action: Click vào icon giỏ hàng
        await page.locator('.shopping_cart_link').click();

        // 4. Assertion: Kiểm tra trong trang giỏ hàng
        // Đảm bảo đã chuyển sang trang cart.html
        await expect(page).toHaveURL(/.*\/cart.html/);
        
        // Đảm bảo sản phẩm ta vừa chọn nằm trong giỏ hàng
        const itemInCart = page.getByText(productName);
        await expect(itemInCart).toBeVisible();
    });

    // Test case 8: Xóa sản phẩm khỏi giỏ hàng
    test('TC8: Xóa sản phẩm khỏi giỏ hàng', async ({ page }) => {
        
        // 1. Setup: Thêm 2 sản phẩm vào giỏ hàng
        await page.locator('#add-to-cart-sauce-labs-backpack').click();
        await page.locator('#add-to-cart-sauce-labs-bike-light').click();
        
        // Kiểm tra có 2 món
        await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

        // 2. Action: Tới giỏ hàng
        await page.locator('.shopping_cart_link').click();

        // 3. Action: Click nút "Remove" của "Sauce Labs Backpack"
        await page.locator('#remove-sauce-labs-backpack').click();

        // 4. Assertion: Kiểm tra
        // Sản phẩm Backpack đã biến mất
        await expect(page.getByText('Sauce Labs Backpack')).toHaveCount(0); 
        // Sản phẩm Bike Light vẫn còn
        await expect(page.getByText('Sauce Labs Bike Light')).toBeVisible(); 
        // Icon giỏ hàng cập nhật còn '1'
        await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    });

    // Test case 9: Hoàn tất quy trình thanh toán
    test('TC9: Hoàn tất thanh toán thành công', async ({ page }) => {
        
        // 1. Setup: Thêm 1 sản phẩm
        await page.locator('#add-to-cart-sauce-labs-fleece-jacket').click();

        // 2. Action: Tới giỏ hàng
        await page.locator('.shopping_cart_link').click();
        await expect(page).toHaveURL(/.*\/cart.html/);

        // 3. Action: Click Checkout
        await page.locator('#checkout').click();
        await expect(page).toHaveURL(/.*\/checkout-step-one.html/);

        // 4. Action: Điền thông tin giao hàng
        await page.locator('#first-name').fill('Binh');
        await page.locator('#last-name').fill('Test');
        await page.locator('#postal-code').fill('700000');

        // 5. Action: Click Continue
        await page.locator('#continue').click();
        await expect(page).toHaveURL(/.*\/checkout-step-two.html/);

        // 6. Assertion: (Tùy chọn) Kiểm tra lại tên hàng và tổng tiền
        await expect(page.getByText('Sauce Labs Fleece Jacket')).toBeVisible();
        await expect(page.getByText('Total: $53.99')).toBeVisible(); // $49.99 + $4.00 Tax

        // 7. Action: Click Finish
        await page.locator('#finish').click();

        // 8. Assertion: Kiểm tra trang hoàn tất
        await expect(page).toHaveURL(/.*\/checkout-complete.html/);
        await expect(page.getByText('Thank you for your order!')).toBeVisible();
    });
});

test.describe('Kịch bản - Tương tác Giỏ hàng & Trang Chi tiết', () => {

    // Hook: Đăng nhập trước mỗi test
    test.beforeEach(async ({ page }) => {
        await page.goto('https://www.saucedemo.com');
        await page.locator('#user-name').fill('standard_user');
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();
        await expect(page).toHaveURL(/.*\/inventory.html/);
    });

    // Test case 14: Thêm hàng từ trang chi tiết sản phẩm
    test('TC14: Thêm hàng từ trang chi tiết sản phẩm', async ({ page }) => {
        
        // 1. Action: Click vào tên sản phẩm "Sauce Labs Backpack"
        await page.getByText('Sauce Labs Backpack').click();

        // 2. Assertion: Kiểm tra đã vào đúng trang chi tiết
        await expect(page).toHaveURL(/.*\/inventory-item.html\?id=4/);
        
        // 3. Action: Click nút "Add to cart" (trên trang chi tiết)
        const addButton = page.getByRole('button', { name: 'Add to cart' });
        await addButton.click();

        // 4. Assertion: Nút đã đổi thành "Remove"
        await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();

        // 5. Assertion: Icon giỏ hàng cập nhật (hiển thị '1')
        const cartBadge = page.locator('.shopping_cart_badge');
        await expect(cartBadge).toHaveText('1');

        // 6. Action: Vào giỏ hàng
        await page.locator('.shopping_cart_link').click();

        // 7. Assertion: Sản phẩm "Sauce Labs Backpack" có trong giỏ
        await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    });

    // Test case 15: Xóa hàng từ trang chi tiết sản phẩm
    test('TC15: Xóa hàng từ trang chi tiết sản phẩm', async ({ page }) => {
        
        // 1. Setup: Thêm món "Sauce Labs Bike Light" vào giỏ trước
        await page.locator('#add-to-cart-sauce-labs-bike-light').click();
        await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

        // 2. Action: Click vào tên sản phẩm "Sauce Labs Bike Light"
        await page.getByText('Sauce Labs Bike Light').click();

        // 3. Assertion: Nút "Remove" đã hiển thị sẵn
        const removeButton = page.getByRole('button', { name: 'Remove' });
        await expect(removeButton).toBeVisible();

        // 4. Action: Click nút "Remove"
        await removeButton.click();

        // 5. Assertion: Nút đổi lại thành "Add to cart"
        await expect(page.getByRole('button', { name: 'Add to cart' })).toBeVisible();

        // 6. Assertion: Icon giỏ hàng biến mất
        await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);

        // 7. Action: (Kiểm tra kỹ) Quay lại trang giỏ hàng
        await page.locator('.shopping_cart_link').click();
        
        // 8. Assertion: Sản phẩm không còn trong giỏ
        await expect(page.getByText('Sauce Labs Bike Light')).toHaveCount(0);
    });

    // Test case 16: Xóa hàng trực tiếp từ trang giỏ hàng
    test('TC16: Xóa hàng trực tiếp từ trang giỏ hàng', async ({ page }) => {
        
        // 1. Setup: Thêm 2 món hàng
        await page.locator('#add-to-cart-sauce-labs-onesie').click();
        await page.locator('#add-to-cart-sauce-labs-fleece-jacket').click();
        await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

        // 2. Action: Vào giỏ hàng
        await page.locator('.shopping_cart_link').click();
        await expect(page).toHaveURL(/.*\/cart.html/);

        // 3. Action: Click nút "Remove" của "Sauce Labs Onesie"
        await page.locator('#remove-sauce-labs-onesie').click();

        // 4. Assertion: Kiểm tra
        // Món "Onesie" đã biến mất
        await expect(page.getByText('Sauce Labs Onesie')).toHaveCount(0);
        // Món "Fleece Jacket" vẫn còn
        await expect(page.getByText('Sauce Labs Fleece Jacket')).toBeVisible();
        // Icon giỏ hàng cập nhật còn '1'
        await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    });
});
test.describe('Kịch bản - Chức năng Đăng xuất', () => {

    // Hook: Đăng nhập trước mỗi test
    test.beforeEach(async ({ page }) => {
        await page.goto('https://www.saucedemo.com');
        await page.locator('#user-name').fill('standard_user');
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();
        
        // Đảm bảo đã đăng nhập thành công
        await expect(page).toHaveURL(/.*\/inventory.html/);
    });

    // Test case 17: Đăng xuất thành công
    test('TC17: Đăng xuất thành công từ trang sản phẩm', async ({ page }) => {
        
        // 1. Action: Click vào nút "burger" menu
        await page.locator('#react-burger-menu-btn').click();

        // 2. Action: Click vào link "Logout"
        // Playwright sẽ tự động chờ cho menu (và link) xuất hiện
        await page.locator('#logout_sidebar_link').click();

        // 3. Assertion: Kiểm tra đã quay về trang đăng nhập
        // URL phải là trang gốc (trang đăng nhập)
        await expect(page).toHaveURL('https://www.saucedemo.com/');
        
        // 4. Assertion (Kiểm tra thêm): Ô username phải hiển thị lại
        await expect(page.locator('#user-name')).toBeVisible();
    });
});