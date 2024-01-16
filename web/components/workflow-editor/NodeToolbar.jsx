import { Divider, Group, Text } from "@mantine/core"
import { useHotkeys } from "@mantine/hooks"
import { modals } from "@mantine/modals"
import { notifications } from "@mantine/notifications"
import { useDeleteElements } from "@web/modules/graph"
import { useCopyElementsToClipboard, useDuplicateElements } from "@web/modules/graph/duplicate"
import { useSelectConnectedEdges, useSelectIncomers, useSelectOutgoers, useSelection, useSelectionRect } from "@web/modules/graph/selection"
import classNames from "classnames"
import { TbArrowLeftSquare, TbArrowRightSquare, TbChartDots3, TbClipboardCopy, TbClipboardPlus, TbCopy, TbTrash } from "react-icons/tb"
import KeyboardShortcut from "./KeyboardShortcut"
import ToolbarIcon from "./ToolbarIcon"


export default function MultiNodeToolbar() {

    const { selected, selectedNodes } = useSelection()
    const { screen } = useSelectionRect()

    const anyNodes = selectedNodes.length > 0
    const multiple = selected.length > 1
    const multipleNodes = selectedNodes.length > 1

    return anyNodes && (
        <div
            className={classNames({
                "absolute z-[4] pointer-events-none": true,
                "outline-dashed outline-gray outline-1 outline-offset-8 rounded-sm": multiple,
            })}
            style={{
                top: `${screen.y}px`,
                left: `${screen.x}px`,
                width: `${screen.width}px`,
                height: `${screen.height}px`,
            }}
        >
            <Group noWrap className="pointer-events-auto gap-0 rounded-sm bg-white shadow-sm base-border mb-md absolute bottom-full left-1/2 -translate-x-1/2">

                <SelectIncomersControl />
                <SelectOutgoersControl />
                {multipleNodes &&
                    <SelectConnectionsControl />}

                <Divider orientation="vertical" color="gray.3" />

                <CopyControl />
                <DuplicateControl />
                <DeleteControl />
            </Group>
        </div>
    )
}


function SelectIncomersControl() {

    const { selectedNodes } = useSelection()
    const selectIncomers = useSelectIncomers(selectedNodes)

    useHotkeys([
        ["mod+shift+ArrowLeft", selectIncomers],
    ])

    return (
        <ToolbarIcon
            label="Select Incomers"
            secondaryLabel={<KeyboardShortcut keys={["Ctrl", "Shift", <>&larr;</>]} lowkey withPluses />}
            onClick={selectIncomers}
            icon={TbArrowLeftSquare}
        />
    )
}


function SelectOutgoersControl() {

    const { selectedNodes } = useSelection()
    const selectOutgoers = useSelectOutgoers(selectedNodes)

    useHotkeys([
        ["mod+shift+ArrowRight", selectOutgoers],
    ])

    return (
        <ToolbarIcon
            label="Select Outgoers"
            secondaryLabel={<KeyboardShortcut keys={["Ctrl", "Shift", <>&rarr;</>]} lowkey withPluses />}
            onClick={selectOutgoers}
            icon={TbArrowRightSquare}
        />
    )
}


function SelectConnectionsControl() {

    const { selectedNodes } = useSelection()
    const selectConnectedEdges = useSelectConnectedEdges(selectedNodes)

    useHotkeys([
        ["mod+e", selectConnectedEdges],
    ])

    return (
        <ToolbarIcon
            label="Select Connections"
            secondaryLabel={<KeyboardShortcut keys={["Ctrl", "E"]} lowkey withPluses />}
            onClick={selectConnectedEdges}
            icon={TbChartDots3}
        />
    )
}


function CopyControl() {

    const { selectedNodes, selectedEdges } = useSelection()

    const _copy = useCopyElementsToClipboard(selectedNodes, selectedEdges)
    const copy = () => {
        _copy()
        notifications.show({
            title: "Copied!",
            icon: <TbClipboardPlus />,
            color: "green",
        })
    }

    useHotkeys([
        ["mod+c", copy],
    ])

    return (
        <ToolbarIcon
            label="Copy"
            secondaryLabel={<KeyboardShortcut keys={["Ctrl", "C"]} lowkey withPluses />}
            onClick={copy}
            icon={TbClipboardCopy}
        />
    )
}


function DuplicateControl() {

    const { selectedNodes, selectedEdges } = useSelection()

    const duplicate = useDuplicateElements(selectedNodes, selectedEdges)

    useHotkeys([
        ["mod+d", duplicate],
    ])

    return (
        <ToolbarIcon
            label="Duplicate"
            secondaryLabel={<KeyboardShortcut keys={["Ctrl", "D"]} lowkey withPluses />}
            onClick={duplicate}
            icon={TbCopy}
        />
    )
}


function DeleteControl() {

    const { selectedNodes, selectedEdges } = useSelection()

    const deleteElements = useDeleteElements(selectedNodes, selectedEdges)

    const confirmDelete = () => modals.openConfirmModal({
        title: `Delete ${selectedNodes.length} nodes`,
        children: <Text size="sm">Are you sure you want to delete these nodes?</Text>,
        labels: {
            confirm: "Delete",
            cancel: "Cancel",
        },
        confirmProps: { color: "red", variant: "filled" },
        cancelProps: { variant: "outline" },
        centered: true,
        onConfirm: deleteElements,
    })

    return (
        <ToolbarIcon
            label="Delete"
            secondaryLabel={<KeyboardShortcut keys={["Backspace"]} lowkey withPluses />}
            onClick={confirmDelete}
            icon={TbTrash}
        />
    )
}