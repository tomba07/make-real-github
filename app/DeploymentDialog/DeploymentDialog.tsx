/* eslint-disable react-hooks/rules-of-hooks */
import { TLUiDialogProps, TLUiDialog } from '@tldraw/tldraw'
import React from 'react'

import { useCallback } from 'react'

export type DeploymentDialogProps = TLUiDialogProps & {
	url?: string
}

export class DeploymentDialog extends React.Component<DeploymentDialogProps> {
	render() {
		const { url, onClose } = this.props

		return (
			<div>
				<p>
					Deployment successful! <a href={url}>Visit GitHub Page</a>
				</p>
				<button onClick={onClose}>Close</button>
			</div>
		)
	}
}
