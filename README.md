# SCAN-Planner ROS 2

[中文说明](README-CN.md) · [Upstream ROS 1 project](https://github.com/wuyi2121/SCAN-Planner) · [Paper](https://arxiv.org/abs/2606.19555)

Native ROS 2 port of **SCAN-Planner: Spatial Collision-Aware Local Planning for Route-Guided Long-Range Quadruped Navigation**. This repository targets **Ubuntu 22.04** and **ROS 2 Humble**, and uses `ament_cmake`, `colcon`, `rclcpp`, RViz2 and `tf2_ros`.

> This is a derivative work of [wuyi2121/SCAN-Planner](https://github.com/wuyi2121/SCAN-Planner). The original algorithm, project design and research work are by Han Zheng, Zhe Chen, Yiwen Fu, Ming Yang and Tong Qin. This repository ports and adapts the project to ROS 2 Humble; it is not an official upstream release.

## Features

- Local planning with B-spline optimization, sliding occupancy mapping and A* search.
- Deterministic Mockamap-based simulation, CPU point-cloud sensing and an optional OpenGL sensing backend.
- Go2 Xacro description, ROS 2 controllers and RViz2 visualization.
- Navigation through RViz2 goals, predefined waypoints or a reference path.

## Requirements

- Ubuntu 22.04
- ROS 2 Humble
- C++17 and `colcon`

Install workspace dependencies:

```bash
sudo apt update
rosdep update
rosdep install --from-paths src --ignore-src -r -y
sudo apt install libarmadillo-dev libglew-dev libglfw3-dev libgl1-mesa-dev libglu1-mesa-dev
```

`LD_LIBRARY_PATH` must not point at incompatible Conda libraries while building ROS packages:

```bash
unset LD_LIBRARY_PATH
source /opt/ros/humble/setup.bash
colcon build --symlink-install --cmake-args -DCMAKE_BUILD_TYPE=Release
source install/setup.bash
```

To build the OpenGL sensing backend, append `-DUSE_GPU=ON` to the CMake arguments.

## Quick start

Start the simulation and planner:

```bash
source install/setup.bash
ros2 launch scan_planner run.launch.py \
  is_real_world:=false navi_mode:=1 sensor_type:=lidar \
  controller_mode:=closed_loop use_gpu:=false
```

In another terminal, start RViz2:

```bash
source install/setup.bash
ros2 launch scan_planner rviz.launch.py
```

Set RViz2's Fixed Frame to `world`, then use the **2D Goal Pose** tool. The default configuration visualizes the Go2 model, `/goal_point`, `/grid_map/sliding_map_bbox`, map clouds and TF.

## Documentation

- [Chinese guide](README-CN.md)
- [ROS 2 migration notes](ROS2_MIGRATION.md)
- [Go2 description package](src/simulator/Utils/go2_description/README.md)
- [Keypoint tool](tools/README.md)

## Citation

If you use SCAN-Planner in academic work, please cite the original authors' paper:

```bibtex
@article{zheng2026scan,
  title={SCAN-Planner: Spatial Collision-Aware Local Planning for Route-Guided Long-Range Quadruped Navigation},
  author={Zheng, Han and Chen, Zhe and Fu, Yiwen and Yang, Ming and Qin, Tong},
  journal={arXiv preprint arXiv:2606.19555},
  year={2026}
}
```

## Contributing and security

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request. Report security vulnerabilities according to [SECURITY.md](SECURITY.md). Participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License and attribution

This port is distributed under the [Apache License 2.0](LICENSE), consistent with the upstream project. Keep the attribution in [NOTICE](NOTICE) when redistributing derivative works. The `NOTICE` file identifies the upstream project and the ROS 2 port changes; it does not imply endorsement by the original authors.
