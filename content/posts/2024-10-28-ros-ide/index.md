If you're working on developing UAV swarms with ROS/ROS2 (Robot Operating System) and Catkin in an Integrated Development Environment (IDE), you’ll need an efficient setup to streamline your development process. This proposed IDE should help you streamline UAV swarm development using ROS, Catkin, and an IDE.

The proposed IDE is meant to optimize programming efficiency. By offering tightly knit components with multiple development utilities as one unified software in which all developments take place. This application usually has a plethora of functions for from scratch development of distributed missions including simulating, compiling, testing, debugging and deployment on the swarm. One goal of this IDE is to simplify the settings required for assembling numerous development tools and to make building and running ROS programs easily.

Figure below shows the conceptual overview of the proposed IDE. The IDE kernel is based on the Catkin build system and the alternative to the former ROS build system (rosbuild). It also, combines a collection of compiling macros (CMake) with Python scripts to build ROS packages. In addition, it is configured to integrate the necessary drivers and dependencies (gazebo-ros-pkgs, mavros and mavlink) to facilitate the implementation of the communication process as well the mission execution on both realistic simulation with Gazebo and on the swarm. The proposed development environment is more powerful than the traditional rosbuild and supports 1) automatic package detection and distribution, as well as the ability to build multiple, interdependent apps in tandem; 2) cross-compilation allowing to execute generated programs on various types of drones; and 3) portability to any ROS projects that support pure CMake and Python. In fact, the project can be used in conjunction with existing CMake projects .

Conceptual overview of the swarm development IDE.

The build system of the IDE consists of three components which may contain different types of targets including libraries, executable ROS nodes, scripts, and exported API or header files (for example, C++ .hpp or python .py):

Gazebo** contains all the simulating elements needed to test a swarm program in a realistic environment. The *.world* files describe the physical (e.g. UAVs or sensors) and abstract (e.g. lights) entities used to model an environment. What's more, to facilitate the reuse of object collections, we create a single *.sdf* file for each model, which can then be easily integrated in the world files. This approach is very useful, as it allows several drone types to be integrated into the world. In addition, commands for launching ROS nodes on stand-alone Gazebo are in the script component. These scripts are highly dependent on the interfaces and functions available in the packages (*gazebo-ros-pkgs*).

Drivers and dependencies** **component contains all tools, plugins and packages used to perform a ROS communication. It offers the interfaces required to mimic a drone in Gazebo with ROS topics and services through the gazebo-ros-pkgs package. All intra- and inter-drone communications are supported by the mavlink protocol, implemented thanks to the mavros package.

Project source** is structured in hierarchical directories by level. The first layer, called *src* directory, is the cornerstone of the missions. It contains all *.cpp* and *.py* files relating to jobs missions and services. While the second layer consists of directories:

msg contains all *.msg* files for describing a specific ROS topic types.

srv and *action* repertories contain a specific *.srv *and* .action *files that describes respectively the headers of predefined services and actions to perform by the UAVs.

launch contains the *.launch* files used to run the ROS nodes across the swarm.

include contains all the external libraries (functions that are already compiled) that can be imported in the ROS project.

To build a target, we need to include specific environment-setup files and environment variables such as the tool chain properties (compiler, assembler, linker, debugger), project properties (workspace, references, builders, generator, run and debug settings), packages and dependencies. This is usually stated in the *CMakeLists.txt* and *packages.xml* configuration files that the build system reads.

In fact, the *packages.xml* file is an XML manifest file which contains instructions for installing, upgrading, and uninstalling any catkin legacy packages. This file describes the attributes of all packages associated with a swarm program such as its unique identifier and name, version numbers, registry, check conditions, files, and dependencies on other catkin-compliance packages.

While the *CMakeLists.txt* oversees scheduling and carrying out the build process. It calls useful catkin functions to explain the build process, such as: find *package() *used to automatically find a given CMake package, catkin *package()* required to specify the information needed to build the environment, add *library()* is used to define which libraries should be built, target link *libraries() *for specifying the libraries with which a target executable is linked. Finally, the add *dependencies()* function allows to add all dependencies that are defined in the *package.xml*.

Check out the new github project repository for the AutoTarget project, aiming to develop an autonomous, task-distributed drone network based on ROS to improve the characterization of isolated, remote targets in a time and resource efficient manner: [https://github.com/hifexplo/autotarget](https://github.com/hifexplo/autotarget)
