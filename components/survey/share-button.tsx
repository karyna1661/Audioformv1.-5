"use client"

import type React from "react"
import { useState } from "react"
import { Button, useToast } from "@chakra-ui/react"
import { CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons"
import { createSurveyUrl } from "../../utils/url" // Updated import
import { useFarcasterShare } from "../../hooks/useFarcasterShare"

interface ShareButtonProps {
  surveyId: string
}

const ShareButton: React.FC<ShareButtonProps> = ({ surveyId }) => {
  const [isCopied, setIsCopied] = useState(false)
  const toast = useToast()
  const { shareToFarcaster } = useFarcasterShare()

  const handleCopyLink = () => {
    const surveyUrl = createSurveyUrl(surveyId) // Updated sharing logic
    navigator.clipboard.writeText(surveyUrl)
    setIsCopied(true)
    toast({
      title: "Link copied to clipboard!",
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    setTimeout(() => {
      setIsCopied(false)
    }, 3000)
  }

  const handleFarcasterShare = async () => {
    const surveyUrl = createSurveyUrl(surveyId) // Updated Farcaster sharing
    await shareToFarcaster(surveyUrl)
  }

  return (
    <>
      <Button leftIcon={<CopyIcon />} onClick={handleCopyLink} isLoading={isCopied} loadingText="Copied!" mr={2}>
        {isCopied ? "Copied!" : "Copy Link"}
      </Button>
      <Button leftIcon={<ExternalLinkIcon />} onClick={handleFarcasterShare}>
        Share to Farcaster
      </Button>
    </>
  )
}

export default ShareButton
