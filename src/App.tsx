import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Button,
  Table,
  Input,
  Modal,
  Form,
  message,
  Space,
  Tag,
  Tooltip,
  Typography,
  Empty,
  Badge,
  Alert,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  CodeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './App.css';

const { Header, Content, Footer } = Layout;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// TypeScript Interfaces
interface TaskExecution {
  startTime: string;
  endTime: string;
  output: string;
}

interface Task {
  id: string;
  name: string;
  owner: string;
  command: string;
  taskExecutions: TaskExecution[];
}

// API Configuration
const API_BASE_URL = 'http://localhost:30080';

const App: React.FC = () => {
  // State Management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const [isExecutionModalVisible, setIsExecutionModalVisible] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [executing, setExecuting] = useState<boolean>(false);
  const [form] = Form.useForm();
  
  // 💡 NEW STATE FOR CUSTOM DELETE MODAL
  const [isConfirmDeleteModalVisible, setIsConfirmDeleteModalVisible] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // API Functions
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
      } else {
        message.error('Failed to fetch tasks');
      }
    } catch (error) {
      message.error('Cannot connect to server. Make sure backend is running.');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // TEST CASE 1: Create Task
  const createTask = async (values: any) => {
    setLoading(true);
    try {
      const taskData = {
        id: values.id.trim(),
        name: values.name.trim(),
        owner: values.owner.trim(),
        command: values.command.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        message.success({
          content: `✅ Task "${taskData.name}" created successfully!`,
          duration: 3,
        });
        setIsCreateModalVisible(false);
        form.resetFields();
        await fetchTasks(); // Refresh the table
      } else {
        const errorText = await response.text();
        message.error(`Failed to create task: ${errorText}`);
      }
    } catch (error) {
      message.error('Error creating task. Check your connection.');
      console.error('Create error:', error);
    } finally {
      setLoading(false);
    }
  };

  // TEST CASE 2: Execute Task
  const executeTask = async (taskId: string) => {
    setExecuting(true);
    const hideLoading = message.loading('Executing task...', 0);
    
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/execute`, {
        method: 'PUT',
      });

      hideLoading();

      if (response.ok) {
        const execution = await response.json();
        message.success({
          content: '✅ Task executed successfully!',
          duration: 3,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        });

        // Fetch updated task for modal if it's open
        if (selectedTask && selectedTask.id === taskId) {
          const taskResponse = await fetch(`${API_BASE_URL}/tasks?id=${taskId}`);
          if (taskResponse.ok) {
            const updatedTask = await taskResponse.json();
            setSelectedTask(updatedTask);
          }
        }

        // Refresh task list
        await fetchTasks();
      } else {
        const errorText = await response.text();
        message.error(`Execution failed: ${errorText}`);
      }
    } catch (error) {
      hideLoading();
      message.error('Error executing task');
      console.error('Execute error:', error);
    } finally {
      setExecuting(false);
    }
  };

  // TEST CASE 5: Delete Task
const deleteTask = async (taskId: string, taskName: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      message.success(`✅ Task "${taskName}" deleted successfully!`);
      await fetchTasks(); // Refresh the table
    } else {
      const errorText = await response.text();
      message.error(`Failed to delete: ${errorText}`);
    }
  } catch (error) {
    message.error('Error deleting task');
    console.error('Delete error:', error);
  }
};

  // TEST CASE 4: Search Tasks
  const searchTasks = async (searchValue: string) => {
    const trimmed = searchValue.trim();

    if (!trimmed) {
      await fetchTasks(); // Reset to all tasks
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/search?name=${encodeURIComponent(trimmed)}`
      );

      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
        message.success(`Found ${data.length} task(s) matching "${trimmed}"`);
      } else if (response.status === 404) {
        setTasks([]);
        message.info(`No tasks found matching "${trimmed}"`);
      } else {
        message.error('Search failed');
      }
    } catch (error) {
      message.error('Error searching tasks');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // TEST CASE 3: View Execution History
  const showExecutionDetails = (task: Task) => {
    setSelectedTask(task);
    setIsExecutionModalVisible(true);
  };

  // 💡 FIXED: Uses state to open the custom modal, bypassing the problematic Modal.confirm utility.
  const confirmDelete = (task: Task) => {
    setTaskToDelete(task);
    setIsConfirmDeleteModalVisible(true);
  };

  // Table Columns Configuration
  const columns: ColumnsType<Task> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (id: string) => (
        <Tag color="blue" icon={<CodeOutlined />}>
          {id}
        </Tag>
      ),
    },
    {
      title: 'Task Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string) => (
        <Text strong style={{ fontSize: '14px' }}>
          {name}
        </Text>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
      width: 180,
      render: (owner: string) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <Text>{owner}</Text>
        </Space>
      ),
    },
    {
      title: 'Command',
      dataIndex: 'command',
      key: 'command',
      ellipsis: true,
      render: (command: string) => (
        <Tooltip title={command} placement="topLeft">
          <Text
            code
            style={{
              fontSize: '12px',
              maxWidth: '300px',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {command}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Executions',
      dataIndex: 'taskExecutions',
      key: 'executions',
      width: 120,
      align: 'center',
      render: (executions: TaskExecution[]) => (
        <Badge
          count={executions?.length || 0}
          showZero
          style={{ backgroundColor: '#52c41a' }}
          overflowCount={99}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 260,
      fixed: 'right',
      render: (_, record: Task) => (
        <Space size="small">
          <Tooltip title="Execute this task">
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                console.log('Execute clicked for:', record.id);
                executeTask(record.id);
              }}
              size="small"
              loading={executing}
              disabled={executing}
            >
              Execute
            </Button>
          </Tooltip>
          <Tooltip title="View execution history">
            <Button
              icon={<InfoCircleOutlined />}
              onClick={() => {
                console.log('Details clicked for:', record.id);
                showExecutionDetails(record);
              }}
              size="small"
            >
              Details
            </Button>
          </Tooltip>
          <Tooltip title="Delete this task permanently">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                console.log('Delete button CLICKED for:', record.id);
                confirmDelete(record);
              }}
              size="small"
              style={{ cursor: 'pointer' }}
            >
              Delete
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Format duration helper
  const formatDuration = (start: string, end: string): string => {
    try {
      const duration = (new Date(end).getTime() - new Date(start).getTime()) / 1000;
      return duration >= 0 ? `${duration.toFixed(2)}s` : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{ background: '#001529', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <Title
            level={3}
            style={{
              color: 'white',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <CodeOutlined />
            Task Execution Manager
          </Title>
          <Badge count={tasks.length} showZero style={{ backgroundColor: '#52c41a' }}>
            <Text style={{ color: 'white', marginRight: '8px', fontSize: '14px' }}>
              Total Tasks
            </Text>
          </Badge>
        </div>
      </Header>

      {/* Main Content */}
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Card
          title={
            <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <Text strong style={{ fontSize: '18px' }}>
                Task Management Dashboard
              </Text>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsCreateModalVisible(true)}
                  size="large"
                >
                  Create New Task
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchTasks}
                  size="large"
                  loading={loading}
                >
                  Refresh
                </Button>
              </Space>
            </Space>
          }
          // The 'bordered' prop is deprecated, but kept for compatibility or use 'variant' instead
          bordered={false}
          style={{ borderRadius: '8px' }}
        >
          {/* Search Bar */}
          <Search
            placeholder="Search tasks by name (e.g., 'backup', 'deploy')..."
            allowClear
            enterButton={
              <Button type="primary" icon={<SearchOutlined />}>
                Search
              </Button>
            }
            size="large"
            onSearch={searchTasks}
            onChange={(e) => {
              if (e.target.value === '') {
                fetchTasks(); // Auto-clear search
              }
            }}
            style={{ marginBottom: '16px' }}
          />

          {/* Info Alert */}
          <Alert
            message="💡 How to Use"
            description="Create tasks with shell commands, execute them to run in Kubernetes pods, view execution history with outputs, search by name, or delete tasks. All operations update in real-time!"
            type="info"
            showIcon
            closable
            style={{ marginBottom: '16px', borderRadius: '6px' }}
          />

          {/* Tasks Table */}
          <Table
            columns={columns}
            dataSource={tasks}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tasks`,
              pageSizeOptions: ['5', '10', '20', '50'],
            }}
            locale={{
              emptyText: (
                <Empty
                  description={
                    <span>
                      No tasks found. Click <strong>"Create New Task"</strong> to get started!
                    </span>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </Content>

      {/* Create Task Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: '#1890ff' }} />
            <span>Create New Task</span>
          </Space>
        }
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={650}
        destroyOnClose // deprecated but kept here
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={createTask}
          autoComplete="off"
          style={{ marginTop: '24px' }}
        >
          <Form.Item
            label="Task ID"
            name="id"
            rules={[
              { required: true, message: 'Please enter a unique task ID' },
              {
                pattern: /^[a-zA-Z0-9-_]+$/,
                message: 'Only letters, numbers, hyphens, and underscores allowed',
              },
            ]}
            extra="Must be unique. Use lowercase with hyphens (e.g., backup-db-001)"
          >
            <Input
              placeholder="e.g., task-001, backup-database, deploy-app"
              prefix={<CodeOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Task Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a descriptive task name' }]}
          >
            <Input placeholder="e.g., Daily Database Backup, Deploy Application" />
          </Form.Item>

          <Form.Item
            label="Owner"
            name="owner"
            rules={[{ required: true, message: 'Please enter the task owner name' }]}
          >
            <Input placeholder="e.g., John Doe, DevOps Team" prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            label="Shell Command"
            name="command"
            rules={[
              { required: true, message: 'Please enter the shell command to execute' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const dangerous = ['rm -rf', 'sudo', 'chmod 777', 'kill -9', '> /dev'];
                  if (dangerous.some((cmd) => value.toLowerCase().includes(cmd))) {
                    return Promise.reject(
                      new Error('Command contains potentially dangerous operations!')
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            extra="Safe commands: echo, date, pwd, ls, hostname, uname, etc."
          >
            <TextArea
              rows={4}
              placeholder="e.g., echo 'Hello World', date, pwd, ls -la"
              style={{ fontFamily: 'monospace', fontSize: '13px' }}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setIsCreateModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
                Create Task
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 💡 FIXED: Custom Delete Confirmation Modal (Now a standard component) */}
      <Modal
        title={
          <Space>
            <DeleteOutlined style={{ color: '#ff4d4f' }} />
            <span>Delete Task</span>
          </Space>
        }
        open={isConfirmDeleteModalVisible}
        onCancel={() => {
          setIsConfirmDeleteModalVisible(false);
          setTaskToDelete(null);
        }}
        onOk={() => {
          if (taskToDelete) {
            // Call the existing deleteTask API function
            deleteTask(taskToDelete.id, taskToDelete.name);
          }
          setIsConfirmDeleteModalVisible(false);
          setTaskToDelete(null);
        }}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        width={450}
        destroyOnClose // deprecated but kept here
      >
        {taskToDelete ? (
          <div>
            <p>Are you sure you want to delete this task?</p>
            <p>
              <strong>ID:</strong> {taskToDelete.id}
            </p>
            <p>
              <strong>Name:</strong> {taskToDelete.name}
            </p>
            <Alert
              message="Irreversible Action"
              description="This action cannot be undone."
              type="error"
              showIcon
              style={{ marginTop: '15px' }}
            />
          </div>
        ) : (
          <p>Task details unavailable.</p>
        )}
      </Modal>

      {/* Execution Details Modal */}
      <Modal
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <span>Task Details & Execution History</span>
            {executing && <Spin size="small" />}
          </Space>
        }
        open={isExecutionModalVisible}
        onCancel={() => setIsExecutionModalVisible(false)}
        footer={[
          <Button
            key="execute"
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={executing}
            onClick={() => selectedTask && executeTask(selectedTask.id)}
            disabled={executing}
          >
            {executing ? 'Executing...' : 'Execute Again'}
          </Button>,
          <Button key="close" onClick={() => setIsExecutionModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={900}
        destroyOnClose // deprecated but kept here
      >
        {selectedTask && (
          <div>
            {/* Task Info Card */}
            <Card size="small" style={{ marginBottom: '20px', background: '#fafafa' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Space>
                  <Text type="secondary">ID:</Text>
                  <Tag color="blue" icon={<CodeOutlined />}>
                    {selectedTask.id}
                  </Tag>
                </Space>
                <Space>
                  <Text type="secondary">Name:</Text>
                  <Text strong style={{ fontSize: '15px' }}>
                    {selectedTask.name}
                  </Text>
                </Space>
                <Space>
                  <Text type="secondary">Owner:</Text>
                  <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Text>{selectedTask.owner}</Text>
                  </Space>
                </Space>
                <Space>
                  <Text type="secondary">Command:</Text>
                  <Text code style={{ fontSize: '13px' }}>
                    {selectedTask.command}
                  </Text>
                </Space>
              </Space>
            </Card>

            {/* Execution History */}
            <Title level={5} style={{ marginTop: '20px', marginBottom: '16px' }}>
              <ClockCircleOutlined /> Execution History (
              {selectedTask.taskExecutions?.length || 0} total)
            </Title>

            {selectedTask.taskExecutions && selectedTask.taskExecutions.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {selectedTask.taskExecutions
                  .slice()
                  .reverse()
                  .map((execution, index) => (
                    <Card
                      key={index}
                      size="small"
                      title={
                        <Space>
                          <ClockCircleOutlined style={{ color: '#52c41a' }} />
                          <Text strong>
                            Execution #{selectedTask.taskExecutions.length - index}
                          </Text>
                          <Tag color="green" icon={<CheckCircleOutlined />}>
                            Completed
                          </Tag>
                        </Space>
                      }
                      style={{ borderLeft: '3px solid #52c41a' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <div>
                          <Text type="secondary">Start Time: </Text>
                          <Text>{new Date(execution.startTime).toLocaleString()}</Text>
                        </div>
                        <div>
                          <Text type="secondary">End Time: </Text>
                          <Text>{new Date(execution.endTime).toLocaleString()}</Text>
                        </div>
                        <div>
                          <Text type="secondary">Duration: </Text>
                          <Tag color="blue">
                            {formatDuration(execution.startTime, execution.endTime)}
                          </Tag>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                          <Text type="secondary" strong>
                            Output:
                          </Text>
                          <Paragraph
                            code
                            copyable={{
                              text: execution.output || 'No output',
                              tooltips: ['Copy output', 'Copied!'],
                            }}
                            style={{
                              marginTop: '8px',
                              background: '#f5f5f5',
                              padding: '12px',
                              borderRadius: '4px',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              fontFamily: 'Consolas, Monaco, monospace',
                              fontSize: '12px',
                              maxHeight: '200px',
                              overflow: 'auto',
                              border: '1px solid #d9d9d9',
                            }}
                          >
                            {execution.output || 'No output recorded'}
                          </Paragraph>
                        </div>
                      </Space>
                    </Card>
                  ))}
              </Space>
            ) : (
              <Empty
                description="No executions yet. Click 'Execute Again' to run this task and see results here."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '40px 0' }}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Footer */}
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        <Text type="secondary">
          Task Execution Manager © 2025 | Built with React 19, TypeScript & Ant Design | Powered
          by Kubernetes
        </Text>
      </Footer>
    </Layout>
  );
};

export default App;