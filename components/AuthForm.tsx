//Form untuk menghandle login dan register

import { useState } from "react";
import {motion} from 'motion/react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {login,signup} from '../lib/auth';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
