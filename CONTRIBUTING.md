# Contributing

Thank you for improving the ROS 2 port of SCAN-Planner.

## Before opening a pull request

1. Discuss substantial design changes in an issue first.
2. Keep ROS 2 Humble and Ubuntu 22.04 compatibility.
3. Do not commit generated `build/`, `install/`, `log/`, bag files or IDE state.
4. Preserve upstream copyright, attribution and Apache-2.0 notices.
5. Build the affected packages before submitting:

   ```bash
   unset LD_LIBRARY_PATH
   source /opt/ros/humble/setup.bash
   colcon build --symlink-install --cmake-args -DCMAKE_BUILD_TYPE=Release
   ```

## Pull requests

- Use a focused title and describe the behavior change, validation and any ROS topic/frame/QoS impact.
- Add or update tests when practical.
- Keep code formatted consistently with the surrounding files.
- By submitting a contribution, you agree to license it under Apache-2.0.

## Upstream acknowledgement

This repository is derived from `wuyi2121/SCAN-Planner`. Changes must continue to credit the original authors and may not imply their endorsement of this ROS 2 port.
