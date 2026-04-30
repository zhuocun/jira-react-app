import { Form, Grid, Input, Modal, Select, Spin, Typography } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useEffect } from "react";

import { microcopy } from "../../constants/microcopy";
import { fontSize, lineHeight, space } from "../../theme/tokens";
import useProjectModal from "../../utils/hooks/useProjectModal";
import useReactMutation from "../../utils/hooks/useReactMutation";
import useReactQuery from "../../utils/hooks/useReactQuery";
import ErrorBox from "../errorBox";

/**
 * Create / edit project surface.
 *
 * Per the surface taxonomy in `docs/ui-ux-optimization-plan.md` §2.A.5, this
 * is a "focused edit / required confirmation" intent and ships as a Modal,
 * not a 100vw side Drawer. Field labels, placeholders, and submit copy come
 * from the central microcopy bundle so casing stays consistent and we never
 * fall back to the banned `Submit` / `OK` strings.
 */
const ProjectModal: React.FC = () => {
    const { isModalOpened, closeModal, editingProject, isLoading } =
        useProjectModal();
    const isEditing = Boolean(editingProject);
    const screens = Grid.useBreakpoint();

    const createProjectMutation = useReactMutation<IProject>(
        "projects",
        "POST"
    );
    const updateProjectMutation = useReactMutation<IProject>("projects", "PUT");
    const activeMutation = isEditing
        ? updateProjectMutation
        : createProjectMutation;
    const { mutateAsync, error, isLoading: mutateLoading } = activeMutation;

    const [form] = useForm();
    const onClose = () => {
        closeModal();
        form.resetFields();
    };
    const onFinish = (input: {
        projectName: string;
        organization: string;
        managerId: string;
    }) => {
        mutateAsync({ ...editingProject, ...input }).then(onClose);
    };
    const submit = () => {
        form.submit();
    };
    const modalTitle = isEditing ? "Edit project" : "Create project";
    const okText = isEditing
        ? microcopy.actions.save
        : `${microcopy.actions.create} project`;

    useEffect(() => {
        form.setFieldsValue(editingProject);
    }, [editingProject, form]);

    const { data: members } = useReactQuery<IMember[]>("users/members");

    return (
        <Modal
            cancelText={microcopy.actions.cancel}
            centered
            confirmLoading={mutateLoading}
            destroyOnHidden={false}
            forceRender
            okButtonProps={{
                block: !screens.sm,
                disabled: isLoading,
                size: "large"
            }}
            cancelButtonProps={{ block: !screens.sm, size: "large" }}
            okText={okText}
            onCancel={onClose}
            onOk={submit}
            open={isModalOpened}
            styles={{
                body: {
                    maxHeight: "calc(100dvh - 220px)",
                    overflowY: "auto"
                }
            }}
            title={modalTitle}
            width="min(520px, calc(100vw - 32px))"
        >
            <Spin
                aria-label={microcopy.a11y.loadingProject}
                spinning={isLoading}
            >
                <Typography.Text
                    style={{
                        display: "block",
                        fontSize: fontSize.sm,
                        lineHeight: lineHeight.normal,
                        marginBottom: space.md,
                        marginTop: -space.xs
                    }}
                    type="secondary"
                >
                    {isEditing
                        ? "Update project details and assignment."
                        : "Set a name, organization, and a manager to start tracking work."}
                </Typography.Text>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{ marginTop: space.sm }}
                >
                    <ErrorBox error={error} />
                    <Form.Item
                        label={microcopy.fields.projectName}
                        name="projectName"
                        required
                        rules={[
                            {
                                required: true,
                                message:
                                    microcopy.validation.projectNameRequired
                            }
                        ]}
                    >
                        <Input autoComplete="off" autoFocus />
                    </Form.Item>
                    <Form.Item
                        label={microcopy.fields.organization}
                        name="organization"
                        required
                        rules={[
                            {
                                required: true,
                                message:
                                    microcopy.validation.organizationRequired
                            }
                        ]}
                    >
                        <Input autoComplete="organization" />
                    </Form.Item>
                    <Form.Item
                        label={microcopy.fields.manager}
                        name="managerId"
                        required
                        rules={[
                            {
                                required: true,
                                message: microcopy.validation.managerRequired
                            }
                        ]}
                    >
                        <Select
                            options={(members ?? []).map((member) => ({
                                label: member.username,
                                value: member._id
                            }))}
                            placeholder={`Select a ${microcopy.fields.manager.toLowerCase()}`}
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default ProjectModal;
