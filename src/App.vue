<script>
export default {
  onLaunch() {
    console.log('[绩效管理] App Launch')
  },
  onShow() {
    console.log('[绩效管理] App Show')
  },
  onHide() {
    console.log('[绩效管理] App Hide')
  }
}
</script>

<style lang="scss">
page {
  background-color: $bg-color;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: $text-primary;
  font-size: 28rpx;
}

view, text, button, input, textarea {
  box-sizing: border-box;
}

/* 通用工具类 */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-center { align-items: center; justify-content: center; }
.flex-between { justify-content: space-between; }
.flex-1 { flex: 1; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.w-full { width: 100%; }
.mt-10 { margin-top: 10rpx; }
.mt-20 { margin-top: 20rpx; }
.mt-30 { margin-top: 30rpx; }
.mb-10 { margin-bottom: 10rpx; }
.mb-20 { margin-bottom: 20rpx; }
.p-20 { padding: 20rpx; }
.p-30 { padding: 30rpx; }

/* 卡片样式 */
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

/* 状态标签 */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 16rpx;
  border-radius: 6rpx;
  font-size: 22rpx;
  line-height: 1.5;
}

/* 按钮样式 */
.btn-primary {
  background: $color-primary;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-outline {
  background: #fff;
  color: $color-primary;
  border: 2rpx solid $color-primary;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-ghost {
  background: transparent;
  color: $text-secondary;
  border: none;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
