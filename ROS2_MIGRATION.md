# ROS 2 Humble 移植状态

## `ros2-humble` 分支已实现内容
- 仓库所有功能包均采用 `package.xml` 格式 3、`ament_cmake` 构建、C++17 标准，并安装了空间资源
- 接口定义统一存放在 `scan_planner_msgs` 包中，所有节点均使用原生 `rclcpp`/`rclpy` 库、ROS 时钟、ROS 2 参数、QoS 策略和 `tf2_ros`
- 规划器保留单线程执行器架构，预设路径点会在收到第一帧里程计数据后异步启动导航
- CPU 与 OpenGL 感知、地图生成、Mockamap 仿真、可视化、控制器和运动学仿真模块均已迁移为 ROS 2 节点
- GPU 感知端依赖系统安装的 GLM、GLFW、GLEW 和 OpenGL 库，仓库内自带的 GLFW/GLM 源码树已不在编译包含/链接路径中
- `run.launch.py`、`simulator.launch.py` 和 `rviz.launch.py` 已替代原有的 ROS 1 XML 启动文件
- Go2 机器人仿真基于 Gazebo Fortress、`ros_gz_sim`、`gz_ros2_control` 搭建，配置了 12 关节轨迹控制器，以及时钟、位姿 TF、IMU 和接触力的桥接模块
- 单元测试覆盖 B 样条求值/求导功能；冒烟测试覆盖常规启动和预设路径点启动两种规划器运行场景

## Ubuntu 22.04 验证标准
由于本仓库移植时的主机未安装 ROS 2 Humble，以下命令为必须执行的集成验证流程：

```bash
source /opt/ros/humble/setup.bash
rosdep install --from-paths src --ignore-src -r -y

colcon build --symlink-install --cmake-args -DCMAKE_BUILD_TYPE=Release
colcon test --event-handlers console_direct+
colcon test-result --verbose

rm -rf build install log
colcon build --symlink-install --cmake-args -DCMAKE_BUILD_TYPE=Release -DUSE_GPU=ON
```

需遍历运行以下参数组合的全量确定性测试矩阵：`sensor_type:=lidar|depth`、`controller_mode:=open_loop|closed_loop`、`use_pcd_map:=false|true`、`navi_mode:=1|2|3`，GPU 测试需要可用 OpenGL 4.x 上下文支持。

QoS 验证相关操作：先启动地图发布节点，再启动感知/RViz2 节点，验证 `/map_generator/global_cloud` 话题通过 Reliable + Transient Local QoS 策略即时传输，`/quad_0/cloud` 点云和深度数据通过 Best Effort SensorDataQoS 策略持续传输。

Gazebo 验证相关操作：

```bash
ros2 launch go2_description go2_sim.launch.py
ros2 control list_controllers
ros2 topic echo /joint_states --once
ros2 topic echo /go2/imu --once
ros2 topic echo /go2/FL_foot_contact --once
ros2 run tf2_tools view_frames
```

预期生效的控制器为 `joint_state_broadcaster` 和 `joint_trajectory_controller`，预期可用的动作为 `/joint_trajectory_controller/follow_joint_trajectory`。

## 基线限制说明
移植主机未配置 ROS 1 运行环境，因此无法在此生成 ROS 1 的轨迹/时序采集数据。在确认数值一致性前，需先在保留的 ROS 1 分支上采集固定随机种子 `127` 的 Mockamap 测试场景数据，再与本分支对比 B 样条控制点、速度/加速度限制、占用栅格输出以及稳定时钟下的规划耗时。