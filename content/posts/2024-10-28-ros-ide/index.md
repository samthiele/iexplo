If you are developing UAV swarms with ROS/ROS2 and Catkin, you need an efficient setup to streamline the process. This proposed IDE is meant to keep tightly knit components and development utilities in one place: simulating, compiling, testing, debugging and deployment on the swarm.

The kernel is based on the Catkin build system. It combines CMake macros with Python scripts to build ROS packages, and is configured to integrate the drivers and dependencies (gazebo-ros-pkgs, mavros and mavlink) needed for communication and mission execution both in Gazebo and on the aircraft. Compared with a traditional rosbuild workflow it aims to provide:

1. automatic package detection and distribution, and the ability to build multiple interdependent apps in tandem
2. cross-compilation so generated programs can run on various drone types

The AutoTarget repository collects this work: [github.com/hifexplo/autotarget](https://github.com/hifexplo/autotarget)
