# BPaste

Ứng dụng quản lý lịch sử clipboard đa nền tảng (Windows / macOS / Linux), lấy cảm hứng từ app **Paste** của macOS. Theo dõi mọi lần sao chép, lưu lịch sử, hiển thị dạng dải thẻ ngang, mở nhanh bằng phím tắt toàn cục và dán lại chỉ với một cú nhấn.

Hỗ trợ 4 loại nội dung: **văn bản**, **liên kết**, **hình ảnh**, và **rich text** (HTML/RTF).

## Tính năng

- Theo dõi clipboard tự động (polling ~600ms qua Electron `clipboard` API, không cần native module).
- Phân loại nội dung: text / link / image / richtext.
- Chống trùng lặp bằng SHA-256 (cột `hash` + UNIQUE index trong SQLite); sao chép lại nội dung cũ sẽ đẩy nó lên đầu thay vì tạo bản ghi mới.
- Overlay frameless bám cạnh dưới màn hình, nền mờ (vibrancy trên macOS, backdrop-blur ở nơi khác).
- Phím tắt toàn cục `Cmd/Ctrl + Shift + V` để hiện/ẩn.
- Tìm kiếm và lọc theo loại nội dung.
- Điều hướng bàn phím: `←/→` di chuyển, `Enter` dán, `Ctrl+Delete` xóa, `Esc` ẩn.
- Ghim (pin) mục quan trọng lên đầu.
- Giới hạn 500 mục gần nhất (mục đã ghim không bị xóa tự động), có nút "Xóa hết".
- Chạy nền trong system tray.

## Kiến trúc

- **Main process** (`src/main`): theo dõi clipboard, lưu SQLite (`better-sqlite3`), quản lý cửa sổ/tray/phím tắt, IPC.
- **Preload** (`src/preload`): cầu nối an toàn qua `contextBridge` (bật `contextIsolation`, tắt `nodeIntegration`).
- **Renderer** (`src/renderer`): React + Vite + Tailwind CSS, giao diện dải thẻ ngang.

Dữ liệu lưu tại thư mục `userData` của Electron:
- `data/bpaste.db` — lịch sử clipboard.
- `images/*.png` — ảnh đã sao chép.

## Yêu cầu

- Node.js 18+ và npm.
- Trên macOS, auto-paste (tùy chọn, chưa bật mặc định) cần quyền Accessibility.

## Phát triển

```bash
npm install
npm run dev
```

`better-sqlite3` là native module. Nếu gặp lỗi phiên bản khi chạy, rebuild theo Electron:

```bash
npm run rebuild
```

## Kiểm tra kiểu (type-check)

```bash
npm run typecheck
```

## Đóng gói

```bash
npm run pack:mac     # macOS (dmg + zip)
npm run pack:win     # Windows (nsis installer)
npm run pack:linux   # Linux (AppImage + deb)
npm run pack:all     # cả ba nền tảng
```

Sản phẩm build nằm trong thư mục `dist/`.

## Phím tắt

| Phím | Hành động |
| --- | --- |
| `Cmd/Ctrl + Shift + V` | Hiện/ẩn cửa sổ BPaste |
| `←` / `→` | Chọn thẻ trước/sau |
| `Enter` | Dán mục đang chọn |
| `Ctrl + Delete` | Xóa mục đang chọn |
| `Esc` | Ẩn cửa sổ |

## Bảo mật & riêng tư

- Lịch sử clipboard lưu cục bộ, không gửi đi đâu.
- Bật `contextIsolation`, tắt `nodeIntegration`, chỉ expose API tối thiểu qua preload.
- Lịch sử có thể chứa dữ liệu nhạy cảm (mật khẩu). Dùng nút "Xóa hết" để dọn, hoặc xóa từng mục.

## Ghi chú

- Dán lại mặc định ghi nội dung vào clipboard rồi bạn tự nhấn `Cmd/Ctrl + V`. Auto-paste (mô phỏng phím dán bằng `nut-js`) là tùy chọn mở rộng.
- Phát hiện thay đổi clipboard dùng polling vì Electron chưa có sự kiện `clipboard-change` gốc đa nền tảng.
